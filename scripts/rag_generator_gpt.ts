#!/usr/bin/env ts-node

/**
 * Script to generate RAG cards using GPT
 * Usage: npm run rag-generator -- "your prompt here"
 */

import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function generateRagCard(prompt: string) {
    try {
        // Initialize OpenAI client
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        if (!process.env.OPENAI_API_KEY) {
            throw new Error('Missing OpenAI API key');
        }

        console.log(`Generating RAG card for: "${prompt}"`);

        // Create the prompt for GPT
        const systemPrompt = `You are an expert in psychology and self-help content creation. 
Your task is to create a comprehensive RAG (Retrieval Augmented Generation) card with three stages: Shadow, Truth, and Integration.

For each stage, provide appropriate content:
- Shadow: Mirror the pattern without giving advice. Focus on reflecting the protective mechanism.
- Truth: Reveal the underlying need and choice context. Help identify the root cause.
- Integration: Provide a micro-practice (1-3 minutes) for body anchoring.

Also provide metadata:
- Title: A concise, descriptive title
- Symptoms: 1-3 relevant psychological symptoms
- Archetypes: 1-2 relevant psychological archetypes
- Modalities: 1-3 relevant modalities (body, breath, cognitive, etc.)
- Language: 'ru' for Russian, 'en' for English

Respond ONLY with valid JSON in this exact format:
{
  "title": "string",
  "stage": ["shadow", "truth", "integration"],
  "symptom": ["string"],
  "archetype": ["string"],
  "modality": ["string"],
  "lang": "ru|en",
  "text": {
    "shadow": "string",
    "truth": "string",
    "integration": "string"
  }
}`;

        const userPrompt = `Create a RAG card for this situation: "${prompt}"`;

        // Call OpenAI API
        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.7,
            max_tokens: 1500,
        });

        // Extract and parse the JSON response
        const rawResponse = response.choices[0].message.content || '';

        // Try to extract JSON from the response
        let jsonString = rawResponse;
        const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            jsonString = jsonMatch[0];
        }

        // Parse the JSON
        const ragCard = JSON.parse(jsonString);

        // Validate the structure
        if (!ragCard.title || !ragCard.text || !ragCard.stage || !ragCard.symptom || !ragCard.archetype || !ragCard.modality || !ragCard.lang) {
            throw new Error('Generated RAG card is missing required fields');
        }

        console.log('✅ Generated RAG card:');
        console.log(JSON.stringify(ragCard, null, 2));

        // Save to a file
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `rag_card_${timestamp}.json`;
        const filepath = path.join(process.cwd(), 'scripts', 'generated', filename);

        // Create directory if it doesn't exist
        const dir = path.dirname(filepath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(filepath, JSON.stringify(ragCard, null, 2));
        console.log(`\n💾 Saved to: ${filepath}`);

        return ragCard;

    } catch (error) {
        console.error('Error generating RAG card:', error);

        // If it's a JSON parsing error, show the raw response
        if (error instanceof SyntaxError) {
            console.error('Raw response that failed to parse:');
        }

        process.exit(1);
    }
}

// Get prompt from command line arguments
const prompt = process.argv.slice(2).join(' ');

if (!prompt) {
    console.error('Usage: npm run rag-generator -- "your prompt here"');
    console.error('Example: npm run rag-generator -- "panic attack after betrayal"');
    process.exit(1);
}

// Run the generator
generateRagCard(prompt);