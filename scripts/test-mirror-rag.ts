#!/usr/bin/env ts-node

/**
 * Script to test the mirror_rag API endpoint
 * Usage: npm run test-mirror-rag
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testMirrorRag() {
    try {
        console.log('🔍 Testing Mirror RAG API endpoint...');

        // Test data
        const testData = {
            query: "I can't sleep because I'm anxious about my relationship",
            stage: "shadow",
            symptom: "anxiety",
            lang: "en"
        };

        console.log('📝 Test data:', JSON.stringify(testData, null, 2));

        // Make request to the API endpoint
        const response = await fetch('http://localhost:3000/api/mirror_rag', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('✅ API Response:', JSON.stringify(result, null, 2));

        console.log('\n🎉 Test completed successfully!');

    } catch (error) {
        console.error('❌ Error testing Mirror RAG API:', error);
        process.exit(1);
    }
}

// Run the test
testMirrorRag();