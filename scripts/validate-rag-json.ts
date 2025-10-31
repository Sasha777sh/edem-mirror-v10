#!/usr/bin/env ts-node

/**
 * Script to validate RAG cards JSON file format
 * Usage: npm run validate-rag-json
 */

import * as fs from 'fs';
import * as path from 'path';

async function validateRagJson() {
    try {
        // Read the JSON file
        const jsonPath = path.join(process.cwd(), 'scripts', 'seed_rag.json');
        const jsonData = fs.readFileSync(jsonPath, 'utf-8');
        const cards = JSON.parse(jsonData);

        console.log(`✅ JSON file is valid`);
        console.log(`📁 File path: ${jsonPath}`);
        console.log(`📊 Total cards: ${cards.length}`);

        // Validate structure of first card
        if (cards.length > 0) {
            const firstCard = cards[0];
            console.log(`\n📋 First card structure:`);
            console.log(`  Title: ${firstCard.title}`);
            console.log(`  Stages: ${firstCard.stage.join(', ')}`);
            console.log(`  Symptoms: ${firstCard.symptom.join(', ')}`);
            console.log(`  Archetypes: ${firstCard.archetype.join(', ')}`);
            console.log(`  Modalities: ${firstCard.modality.join(', ')}`);
            console.log(`  Language: ${firstCard.lang}`);
            console.log(`  Text preview: ${firstCard.text.substring(0, 50)}...`);
        }

        // Validate all cards have required fields and check for issues
        let validCards = 0;
        let emptyFieldCards = 0;
        let duplicateSymptomCards = 0;
        let stageOrderErrors = 0;

        for (const card of cards) {
            let hasEmptyFields = false;
            let hasDuplicateSymptoms = false;
            let hasStageOrderError = false;

            // Check for empty fields
            if (!card.title || card.title.trim() === '') {
                console.log(`❌ Card has empty title: ${card.title || 'Untitled'}`);
                hasEmptyFields = true;
            }

            if (!card.stage || card.stage.length === 0) {
                console.log(`❌ Card has no stages: ${card.title || 'Untitled'}`);
                hasEmptyFields = true;
            }

            if (!card.symptom || card.symptom.length === 0) {
                console.log(`❌ Card has no symptoms: ${card.title || 'Untitled'}`);
                hasEmptyFields = true;
            }

            if (!card.archetype || card.archetype.length === 0) {
                console.log(`❌ Card has no archetypes: ${card.title || 'Untitled'}`);
                hasEmptyFields = true;
            }

            if (!card.modality || card.modality.length === 0) {
                console.log(`❌ Card has no modalities: ${card.title || 'Untitled'}`);
                hasEmptyFields = true;
            }

            if (!card.lang || card.lang.trim() === '') {
                console.log(`❌ Card has empty language: ${card.title || 'Untitled'}`);
                hasEmptyFields = true;
            }

            if (!card.text || card.text.trim() === '') {
                console.log(`❌ Card has empty text: ${card.title || 'Untitled'}`);
                hasEmptyFields = true;
            }

            if (hasEmptyFields) {
                emptyFieldCards++;
            }

            // Check for duplicate symptoms
            const uniqueSymptoms = new Set(card.symptom);
            if (uniqueSymptoms.size !== card.symptom.length) {
                console.log(`❌ Card has duplicate symptoms: ${card.title || 'Untitled'}`);
                hasDuplicateSymptoms = true;
                duplicateSymptomCards++;
            }

            // Check stage order (shadow -> truth -> integration)
            const validStageOrder = ['shadow', 'truth', 'integration'];
            const stageIndices = card.stage.map((stage: string) => validStageOrder.indexOf(stage))
                .filter((index: number) => index !== -1)
                .sort((a: number, b: number) => a - b);

            // Check if stages are in valid order
            for (let i = 0; i < stageIndices.length - 1; i++) {
                if (stageIndices[i] > stageIndices[i + 1]) {
                    console.log(`❌ Card has invalid stage order: ${card.title || 'Untitled'}`);
                    hasStageOrderError = true;
                    stageOrderErrors++;
                    break;
                }
            }

            // Check if integration stage exists without truth stage
            if (card.stage.includes('integration') && !card.stage.includes('truth')) {
                console.log(`❌ Card has integration stage without truth stage: ${card.title || 'Untitled'}`);
                hasStageOrderError = true;
                stageOrderErrors++;
            }

            if (!hasEmptyFields && !hasDuplicateSymptoms && !hasStageOrderError) {
                validCards++;
            }
        }

        console.log(`\n✅ ${validCards} out of ${cards.length} cards are fully valid`);
        console.log(`⚠️  ${emptyFieldCards} cards have empty fields`);
        console.log(`⚠️  ${duplicateSymptomCards} cards have duplicate symptoms`);
        console.log(`⚠️  ${stageOrderErrors} cards have stage order errors`);

        // Show distribution of symptoms
        const symptoms = new Map<string, number>();
        for (const card of cards) {
            for (const symptom of card.symptom) {
                symptoms.set(symptom, (symptoms.get(symptom) || 0) + 1);
            }
        }

        console.log(`\n📊 Symptom distribution:`);
        const sortedSymptoms = Array.from(symptoms.entries()).sort((a, b) => b[1] - a[1]);
        for (const [symptom, count] of sortedSymptoms) {
            console.log(`  ${symptom}: ${count}`);
        }

    } catch (error) {
        console.error('❌ Error validating RAG JSON:', error);
        process.exit(1);
    }
}

// Run the validation
validateRagJson();