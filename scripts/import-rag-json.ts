#!/usr/bin/env ts-node

/**
 * Script to import RAG cards from JSON file into Supabase database
 * Usage: npm run import-rag-json
 */

import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function importRagCards() {
    try {
        // Read the JSON file
        const jsonPath = path.join(process.cwd(), 'scripts', 'seed_rag.json');
        const jsonData = fs.readFileSync(jsonPath, 'utf-8');
        const cards = JSON.parse(jsonData);

        // Initialize Supabase client
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error('Missing Supabase environment variables');
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Clear existing data (optional)
        console.log('Clearing existing RAG chunks...');
        const { error: deleteError } = await supabase
            .from('rag_chunks')
            .delete()
            .neq('id', '0'); // Delete all records (using a condition that matches all)

        if (deleteError) {
            console.error('Error clearing existing data:', deleteError);
            // Continue anyway as we might just want to insert
        }

        // Insert new data
        console.log(`Importing ${cards.length} RAG cards...`);

        // Process cards in batches to avoid timeouts
        const batchSize = 10;
        for (let i = 0; i < cards.length; i += batchSize) {
            const batch = cards.slice(i, i + batchSize);

            // Add id and created_at fields
            const batchWithIds = batch.map((card: any, index: number) => ({
                ...card,
                id: String(i + index + 1),
                created_at: new Date().toISOString()
            }));

            const { data, error } = await supabase
                .from('rag_chunks')
                .insert(batchWithIds);

            if (error) {
                console.error(`Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error);
            } else {
                console.log(`Batch ${Math.floor(i / batchSize) + 1} imported successfully (${batch.length} cards)`);
            }

            // Add a small delay between batches
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Verify the import
        const { count, error: countError } = await supabase
            .from('rag_chunks')
            .select('*', { count: 'exact', head: true });

        if (countError) {
            console.error('Error counting imported records:', countError);
        } else {
            console.log(`✅ Successfully imported ${count} RAG cards into the database`);
        }

        // Show sample data
        const { data: sampleData, error: sampleError } = await supabase
            .from('rag_chunks')
            .select('title, symptom')
            .limit(5);

        if (sampleError) {
            console.error('Error fetching sample data:', sampleError);
        } else {
            console.log('\nSample imported cards:');
            sampleData?.forEach((card: any) => {
                console.log(`- ${card.title} (${card.symptom.join(', ')})`);
            });
        }

    } catch (error) {
        console.error('Error importing RAG cards:', error);
        process.exit(1);
    }
}

// Run the import
importRagCards();