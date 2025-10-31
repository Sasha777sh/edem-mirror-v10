#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
    console.log('Generating embeddings for RAG chunks...');

    // Check if required environment variables are set
    if (!process.env.OPENAI_API_KEY) {
        console.error('Error: OPENAI_API_KEY environment variable is not set');
        process.exit(1);
    }

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables must be set');
        process.exit(1);
    }

    // Initialize OpenAI
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    // Initialize Supabase
    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    async function generateEmbedding(text: string) {
        try {
            const response = await openai.embeddings.create({
                model: 'text-embedding-ada-002',
                input: text,
            });
            return response.data[0].embedding;
        } catch (error) {
            console.error('Error generating embedding:', error);
            return null;
        }
    }

    // Process all YAML files in the corpus directory
    const corpusDir = path.join(__dirname, '../corpus');

    async function processDirectory(dir: string) {
        const files = fs.readdirSync(dir);

        for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                await processDirectory(filePath);
            } else if (file.endsWith('.yml') || file.endsWith('.yaml')) {
                console.log(`Processing ${filePath}...`);
                await processYamlFile(filePath);
            }
        }
    }

    async function processYamlFile(filePath: string) {
        try {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const parsed: any = yaml.parse(fileContent);

            // Get the first key (collection name)
            const collectionKey = Object.keys(parsed)[0];
            const entries = parsed[collectionKey] as any[];

            for (const entry of entries) {
                console.log(`  Processing entry: ${entry.title}`);

                // Generate embedding for the content
                const embedding = await generateEmbedding(entry.content);

                if (embedding) {
                    // Insert into database
                    const { error } = await supabase
                        .from('rag_chunks')
                        .insert({
                            title: entry.title,
                            stage: Array.isArray(entry.stage) ? entry.stage : [entry.stage],
                            symptom: Array.isArray(entry.symptom) ? entry.symptom : [entry.symptom],
                            archetype: Array.isArray(entry.archetype) ? entry.archetype : [entry.archetype],
                            modality: Array.isArray(entry.modality) ? entry.modality : [entry.modality],
                            language: entry.language || 'ru',
                            reading_time: entry.reading_time || 1.0,
                            text_content: entry.content,
                            embedding: embedding
                        });

                    if (error) {
                        console.error(`    Error inserting ${entry.title}:`, error);
                    } else {
                        console.log(`    ✓ Inserted ${entry.title}`);
                    }
                }
            }
        } catch (error) {
            console.error(`Error processing ${filePath}:`, error);
        }
    }

    // Process all corpus files
    await processDirectory(corpusDir);

    console.log('Embedding generation completed!');
}

// Run the script
main().catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
});