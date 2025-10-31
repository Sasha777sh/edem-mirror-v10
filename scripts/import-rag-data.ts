#!/usr/bin/env node

/**
 * Script to import RAG data into the database
 * Usage: npm run import-rag-data
 */

import { createClient } from '@supabase/supabase-js';
import { readFile, readdir } from 'fs/promises';
import { join } from 'path';

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Mock embedding function (in real implementation, use OpenAI embeddings API)
async function generateEmbedding(text: string): Promise<number[]> {
    // This is a mock implementation - in real system, you would call OpenAI embeddings API
    // For demo purposes, we'll generate a fixed-size vector
    const vector = [];
    for (let i = 0; i < 1536; i++) {
        vector.push(Math.random() * 2 - 1); // Random values between -1 and 1
    }
    return vector;
}

// Parse markdown/YAML file content
async function parseContent(content: string, filename: string): Promise<any[]> {
    const chunks = [];

    // Parse YAML frontmatter and markdown content
    // This is a simplified parser for demonstration

    // Split by documents (triple dashes)
    const documents = content.split('---\n').filter(doc => doc.trim() !== '');

    for (let i = 0; i < documents.length; i++) {
        const doc = documents[i].trim();
        if (!doc) continue;

        // Simple frontmatter parsing
        const lines = doc.split('\n');
        const metadata: any = {};
        let contentStart = 0;

        // Parse metadata
        for (let j = 0; j < lines.length; j++) {
            const line = lines[j];
            if (line.includes(':')) {
                const [key, value] = line.split(':').map(s => s.trim());
                if (value.startsWith('[') && value.endsWith(']')) {
                    // Array value
                    metadata[key] = value.substring(1, value.length - 1).split(',').map(s => s.trim().replace('"', '').replace('"', ''));
                } else {
                    // String value
                    metadata[key] = value.replace('"', '').replace('"', '');
                }
                contentStart = j + 1;
            } else {
                break;
            }
        }

        // Extract content
        const textContent = lines.slice(contentStart).join('\n').trim();

        const chunk = {
            title: metadata.title || `${filename} - Document ${i + 1}`,
            stage: metadata.stage || ['shadow'],
            symptom: metadata.symptom || ['anxiety'],
            archetype: metadata.archetype || ['victim'],
            modality: metadata.modality || ['cognitive'],
            language: metadata.language || 'ru',
            reading_time: parseFloat(metadata.reading_time) || 1.5,
            text_content: textContent
        };

        chunks.push(chunk);
    }

    return chunks;
}

// Import data from files
async function importData() {
    try {
        console.log('Starting RAG data import...');

        // Directory with sample data files
        const dataDir = join(process.cwd(), 'data', 'rag');

        // Check if directory exists
        let files: string[] = [];
        try {
            files = await readdir(dataDir);
            console.log(`Found ${files.length} files in data/rag directory`);
        } catch (error) {
            console.log('data/rag directory not found, using mock data...');
            // Use mock data
            const mockChunks = [
                {
                    title: "Обесценивание как защита",
                    stage: ["shadow", "truth"],
                    symptom: ["anxiety", "self_doubt"],
                    archetype: ["victim"],
                    modality: ["cognitive"],
                    language: "ru",
                    reading_time: 2.5,
                    text_content: "Обесценивание - это защитный механизм, который помогает избегать боли от критики. Когда мы обесцениваем чьи-то слова, мы защищаем свою самооценку, но теряем возможность услышать полезную обратную связь."
                },
                {
                    title: "Гнев как защита от стыда",
                    stage: ["shadow", "truth"],
                    symptom: ["anger", "shame"],
                    archetype: ["persecutor"],
                    modality: ["body"],
                    language: "ru",
                    reading_time: 3.0,
                    text_content: "Гнев часто маскирует глубокое чувство стыда. Когда мы злимся, мы отвлекаемся от боли стыда и чувствуем себя более сильными. Однако настоящая сила в том, чтобы признать стыд и работать с ним."
                },
                {
                    title: "Дыхательная практика для тревоги",
                    stage: ["integration"],
                    symptom: ["anxiety", "sleep"],
                    archetype: ["victim"],
                    modality: ["breath"],
                    language: "ru",
                    reading_time: 1.5,
                    text_content: "Практика: вдох на 4 секунды, задержка на 2 секунды, выдох на 6 секунд. Повторить 5 раз. Эта практика активирует парасимпатическую нервную систему и снижает уровень тревоги."
                }
            ];

            console.log(`Inserting ${mockChunks.length} mock chunks...`);

            // Generate embeddings and insert chunks
            for (const chunk of mockChunks) {
                try {
                    // Generate embedding
                    const embedding = await generateEmbedding(chunk.text_content);

                    // Insert into database
                    const { error } = await supabase
                        .from('rag_chunks')
                        .insert({
                            ...chunk,
                            embedding
                        });

                    if (error) {
                        console.error(`Error inserting chunk "${chunk.title}":`, error);
                    } else {
                        console.log(`Successfully inserted chunk "${chunk.title}"`);
                    }
                } catch (error) {
                    console.error(`Error processing chunk "${chunk.title}":`, error);
                }
            }

            console.log('Mock data import completed!');
            return;
        }

        // Process real files
        for (const file of files) {
            if (file.endsWith('.md')) {
                try {
                    console.log(`Processing file: ${file}`);
                    const filePath = join(dataDir, file);
                    const content = await readFile(filePath, 'utf-8');

                    const chunks = await parseContent(content, file);
                    console.log(`Parsed ${chunks.length} chunks from ${file}`);

                    // Generate embeddings and insert chunks
                    for (const chunk of chunks) {
                        try {
                            // Generate embedding
                            const embedding = await generateEmbedding(chunk.text_content);

                            // Insert into database
                            const { error } = await supabase
                                .from('rag_chunks')
                                .insert({
                                    ...chunk,
                                    embedding
                                });

                            if (error) {
                                console.error(`Error inserting chunk "${chunk.title}":`, error);
                            } else {
                                console.log(`Successfully inserted chunk "${chunk.title}"`);
                            }
                        } catch (error) {
                            console.error(`Error processing chunk "${chunk.title}":`, error);
                        }
                    }
                } catch (error) {
                    console.error(`Error processing file ${file}:`, error);
                }
            }
        }

        console.log('RAG data import completed!');

    } catch (error) {
        console.error('Error during data import:', error);
        process.exit(1);
    }
}

// Run the import
importData().then(() => {
    console.log('RAG data import script completed');
    process.exit(0);
}).catch((error) => {
    console.error('Error running import script:', error);
    process.exit(1);
});