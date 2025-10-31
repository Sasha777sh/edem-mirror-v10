#!/usr/bin/env ts-node

/**
 * Simplified script to import corpus data into the RAG system
 * Usage: npm run import-corpus
 */

import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs/promises';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { load as loadYaml } from 'js-yaml';

// Mock embedding function
async function mockEmbed(text: string): Promise<number[]> {
    // Return a mock embedding with some variance
    return Array.from({ length: 1536 }, () => Math.random() * 2 - 1);
}

// Parse YAML file
function parseYAML(raw: string): any {
    try {
        return loadYaml(raw);
    } catch (error) {
        console.error('Error parsing YAML:', error);
        return {};
    }
}

// Load directory of YAML files
async function loadDir(dir: string) {
    const files = await fs.readdir(dir);
    const out: any[] = [];

    for (const f of files) {
        if (f.endsWith('.yml') || f.endsWith('.yaml')) {
            try {
                const p = path.join(dir, f);
                const raw = await fs.readFile(p, 'utf8');
                const doc = parseYAML(raw);

                // Combine all text fields for embedding
                const textParts = [
                    doc.shadow || '',
                    doc.truth || '',
                    doc.integration ? JSON.stringify(doc.integration) : '',
                    doc.text || ''
                ].filter(part => part.length > 0);

                const text = textParts.join('\n');
                const embedding = await mockEmbed(text);

                out.push({
                    title: doc.title || doc.key,
                    stage: doc.stage,
                    symptom: doc.symptom || [],
                    archetype: doc.archetype || [],
                    modality: doc.modality || [],
                    lang: doc.lang || 'ru',
                    text,
                    embedding
                });
            } catch (error) {
                console.error(`Error processing file ${f}:`, error);
            }
        }
    }

    return out;
}

// Main import function
async function importCorpus() {
    try {
        console.log('Starting corpus import...');

        // Load environment variables
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            console.error('Missing Supabase environment variables');
            process.exit(1);
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Check if corpus directory exists
        const corpusDir = path.join(process.cwd(), 'corpus');
        try {
            await fs.access(corpusDir);
        } catch (error) {
            console.log('Corpus directory not found, creating sample data...');

            // Create sample data
            const sampleChunks = [
                {
                    title: "Контроль как защита от страха",
                    stage: ["shadow", "truth", "integration"],
                    symptom: ["anxiety", "breakup"],
                    archetype: ["rescuer", "persecutor"],
                    modality: ["cognitive", "body"],
                    lang: "ru",
                    text: "Зеркало: вижу контроль. Триггер: когда другие свободны. Цена: ты теряешь доверие и связь.\nПравда: тебе важна безопасность. Ты закрываешь её контролем, потому что боишься провала и стыда.\nШаг на сегодня (≤3 мин): Стой, почувствуй стопы 30 сек, опиши 3 факта без интерпретаций.\nЯкорь в теле: ощущение опоры и стабильности.\nЗавтра спрошу: сделал ли и что изменилось (0–10).",
                    embedding: Array.from({ length: 1536 }, () => Math.random() * 2 - 1)
                },
                {
                    title: "Заземление 30 сек",
                    stage: ["integration"],
                    symptom: ["anxiety"],
                    archetype: ["victim"],
                    modality: ["body"],
                    lang: "ru",
                    text: "Встань. Чувствуй стопы на полу, вес тела.\nСделай 4 спокойных выдоха длиннее вдоха.\nНазови 3 факта из текущего момента.",
                    embedding: Array.from({ length: 1536 }, () => Math.random() * 2 - 1)
                }
            ];

            console.log(`Inserting ${sampleChunks.length} sample chunks...`);

            for (const chunk of sampleChunks) {
                const { error } = await supabase.from('rag_chunks').insert(chunk);
                if (error) {
                    console.error(`Error inserting chunk "${chunk.title}":`, error);
                } else {
                    console.log(`Successfully inserted chunk "${chunk.title}"`);
                }
            }

            console.log('Sample data import completed!');
            return;
        }

        // Load real corpus data
        const bundles = [
            ...(await loadDir(path.join(corpusDir, 'glossary'))),
            ...(await loadDir(path.join(corpusDir, 'protocols'))),
            ...(await loadDir(path.join(corpusDir, 'maps')))
        ];

        console.log(`Importing ${bundles.length} chunks...`);

        let successCount = 0;
        for (const item of bundles) {
            const { error } = await supabase.from('rag_chunks').insert(item);
            if (error) {
                console.error(`Error inserting item:`, error);
            } else {
                successCount++;
            }
        }

        console.log(`Corpus import completed! Successfully imported ${successCount} chunks.`);

    } catch (error) {
        console.error('Error during corpus import:', error);
        process.exit(1);
    }
}

// Run the import
importCorpus().then(() => {
    console.log('Corpus import script completed');
    process.exit(0);
}).catch((error) => {
    console.error('Error running import script:', error);
    process.exit(1);
});