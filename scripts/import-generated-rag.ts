#!/usr/bin/env ts-node

/**
 * Script to import generated RAG cards into the database
 * Usage: npm run import-generated-rag -- [filename]
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function importGeneratedRag(filename?: string) {
    try {
        // Initialize Supabase client
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error('Missing Supabase environment variables');
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        let filesToImport: string[] = [];

        if (filename) {
            // Import specific file
            const filepath = path.join(process.cwd(), filename);
            if (!fs.existsSync(filepath)) {
                throw new Error(`File not found: ${filepath}`);
            }
            filesToImport = [filepath];
        } else {
            // Import all generated files
            const generatedDir = path.join(process.cwd(), 'scripts', 'generated');
            if (!fs.existsSync(generatedDir)) {
                throw new Error(`Generated directory not found: ${generatedDir}`);
            }

            filesToImport = fs.readdirSync(generatedDir)
                .filter(file => file.endsWith('.json'))
                .map(file => path.join(generatedDir, file));
        }

        console.log(`Found ${filesToImport.length} files to import`);

        let importedCount = 0;

        for (const filepath of filesToImport) {
            try {
                console.log(`\nImporting: ${path.basename(filepath)}`);

                // Read and parse the JSON file
                const jsonData = fs.readFileSync(filepath, 'utf-8');
                const card = JSON.parse(jsonData);

                // Validate required fields
                if (!card.title || !card.stage || !card.symptom || !card.archetype || !card.modality || !card.lang || !card.text) {
                    console.warn(`⚠️  Skipping ${path.basename(filepath)}: Missing required fields`);
                    continue;
                }

                // Insert into database
                const { data, error } = await supabase
                    .from('rag_chunks')
                    .insert({
                        title: card.title,
                        stage: card.stage,
                        symptom: card.symptom,
                        archetype: card.archetype,
                        modality: card.modality,
                        lang: card.lang,
                        text: card.text,
                        reading_time: card.text.shadow ?
                            Math.ceil(card.text.shadow.split(' ').length / 200) :
                            Math.ceil(JSON.stringify(card.text).split(' ').length / 200)
                    })
                    .select();

                if (error) {
                    console.error(`❌ Error importing ${path.basename(filepath)}:`, error.message);
                    continue;
                }

                console.log(`✅ Imported: ${card.title}`);
                importedCount++;

                // Optionally, delete the file after successful import
                // fs.unlinkSync(filepath);
            } catch (error) {
                console.error(`❌ Error processing ${path.basename(filepath)}:`, error);
            }
        }

        console.log(`\n🎉 Import completed! Successfully imported ${importedCount} cards.`);

    } catch (error) {
        console.error('Error importing RAG cards:', error);
        process.exit(1);
    }
}

// Get filename from command line arguments
const filename = process.argv[2];

// Run the import
importGeneratedRag(filename);