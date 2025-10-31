#!/usr/bin/env ts-node

/**
 * Script to send RAG cards via Telegram or other channels
 * Usage: npm run cron-rag-push
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

interface RAGCard {
    id: string;
    title: string;
    stage: string[];
    symptom: string[];
    archetype: string[];
    modality: string[];
    lang: 'ru' | 'en';
    text: string | { shadow: string; truth: string; integration: string };
    created_at: string;
}

async function sendRagPush() {
    try {
        // Initialize Supabase client
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error('Missing Supabase environment variables');
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        console.log('🔍 Fetching RAG cards for daily push...');

        // Get a random RAG card
        const { data: cards, error } = await supabase
            .from('rag_chunks')
            .select('*')
            .limit(1);

        if (error) {
            throw new Error(`Error fetching RAG cards: ${error.message}`);
        }

        if (!cards || cards.length === 0) {
            console.log('No RAG cards found');
            return;
        }

        const card = cards[0] as RAGCard;
        console.log(`📋 Selected card: ${card.title}`);

        // For demo purposes, we'll just log what would be sent
        console.log('\n📤 RAG Card of the Day:');
        console.log('======================');
        console.log(`Title: ${card.title}`);
        console.log(`Stages: ${card.stage.join(', ')}`);
        console.log(`Symptoms: ${card.symptom.join(', ')}`);
        console.log(`Language: ${card.lang}`);
        console.log('\nContent:');

        if (typeof card.text === 'object' && card.text !== null) {
            if (card.text.shadow) console.log(`\n🌑 Shadow:\n${card.text.shadow}`);
            if (card.text.truth) console.log(`\n⚡ Truth:\n${card.text.truth}`);
            if (card.text.integration) console.log(`\n🌱 Integration:\n${card.text.integration}`);
        } else {
            console.log(`\n${card.text}`);
        }

        console.log('\n📝 Note: In a real implementation, this would be sent via Telegram or other channels');

        // Here you would implement the actual sending logic:
        // 1. Get users who subscribed to daily RAG cards
        // 2. Format the message for each channel (Telegram, email, etc.)
        // 3. Send the messages

        console.log('\n✅ RAG push process completed');

    } catch (error) {
        console.error('Error in RAG push:', error);
        process.exit(1);
    }
}

// Run the script
sendRagPush();