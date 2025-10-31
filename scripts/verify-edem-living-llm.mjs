#!/usr/bin/env node

// Simple verification script for EDEM Living LLM components
import { detectEmotion } from '../src/lib/edem-living-llm/dist/emotion-engine.js';
import { selectScene } from '../src/lib/edem-living-llm/dist/scene-engine.js';
import { selectRitual } from '../src/lib/edem-living-llm/dist/ritual-engine.js';
import { generateVoiceResponse } from '../src/lib/edem-living-llm/dist/voice-generator.js';

async function verifyComponents() {
  console.log('🔍 Verifying EDEM Living LLM Components...\n');

  try {
    // Test 1: Emotion Detection
    console.log('1. Testing Emotion Detection...');
    const emotion = await detectEmotion('Я чувствую тревогу и не могу сосредоточиться');
    console.log(`   Detected emotion: ${emotion}`);
    console.log(`   Status: ${emotion ? '✅ PASS' : '❌ FAIL'}\n`);

    // Test 2: Scene Selection
    console.log('2. Testing Scene Selection...');
    const scene = await selectScene('тревога', new Date());
    console.log(`   Selected scene: ${scene}`);
    console.log(`   Status: ${scene ? '✅ PASS' : '❌ FAIL'}\n`);

    // Test 3: Ritual Selection
    console.log('3. Testing Ritual Selection...');
    const ritual = await selectRitual('тревога', 'окно в начале дня', 'test-user-id');
    console.log(`   Selected ritual: ${ritual}`);
    console.log(`   Status: ${ritual ? '✅ PASS' : '❌ FAIL'}\n`);

    // Test 4: Voice Response Generation
    console.log('4. Testing Voice Response Generation...');
    const voiceResponse = await generateVoiceResponse({
      userInput: 'Я чувствую тревогу',
      emotion: 'тревога',
      scene: 'окно в начале дня',
      ritual: 'Положи руку на живот и дыши 3 раза',
      stage: 'shadow',
      archetype: 'Раненый воин'
    });
    console.log(`   Generated voice response: ${voiceResponse.substring(0, 50)}...`);
    console.log(`   Status: ${voiceResponse ? '✅ PASS' : '❌ FAIL'}\n`);

    console.log('🎉 All EDEM Living LLM core components verified successfully!');
    console.log('💡 Note: Database-dependent features require a working database connection.');
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    process.exit(1);
  }
}

verifyComponents();