#!/usr/bin/env node

// Change to the project root directory
process.chdir(__dirname + '/..');

const { detectEmotion } = require('./src/lib/edem-living-llm/emotion-engine');
const { selectRitual } = require('./src/lib/edem-living-llm/ritual-engine');
const { selectScene } = require('./src/lib/edem-living-llm/scene-engine');
const { generateVoiceResponse } = require('./src/lib/edem-living-llm/voice-generator');

async function runTests() {
  console.log('Testing EDEM Living LLM components...\n');

  // Test emotion detection
  console.log('1. Testing emotion detection...');
  try {
    const emotion1 = await detectEmotion('Я чувствую тревогу');
    console.log('   Тревога detection:', emotion1 === 'тревога' ? '✅ PASS' : '❌ FAIL');

    const emotion2 = await detectEmotion('Меня переполняет стыд');
    console.log('   Стыд detection:', emotion2 === 'стыд' ? '✅ PASS' : '❌ FAIL');

    const emotion3 = await detectEmotion('Я чувствую что-то неопределенное');
    console.log('   Default emotion:', emotion3 === 'тревога' ? '✅ PASS' : '❌ FAIL');
  } catch (error) {
    console.log('   Emotion detection test failed:', error.message);
  }

  // Test scene selection
  console.log('\n2. Testing scene selection...');
  try {
    const scene = await selectScene('тревога', new Date('2023-01-01T10:00:00Z'));
    console.log('   Scene selection:', scene ? '✅ PASS' : '❌ FAIL');
    if (scene) console.log('   Selected scene:', scene);
  } catch (error) {
    console.log('   Scene selection test failed:', error.message);
  }

  // Test ritual selection
  console.log('\n3. Testing ritual selection...');
  try {
    const ritual = await selectRitual('тревога', 'окно в начале дня', 'test-user-id');
    console.log('   Ritual selection:', ritual ? '✅ PASS' : '❌ FAIL');
    if (ritual) console.log('   Selected ritual:', ritual);
  } catch (error) {
    console.log('   Ritual selection test failed:', error.message);
  }

  // Test voice generation
  console.log('\n4. Testing voice generation...');
  try {
    const params = {
      userInput: 'Я чувствую тревогу',
      emotion: 'тревога',
      scene: 'окно в начале дня',
      ritual: 'Положи руку на живот и дыши 3 раза',
      stage: 'shadow',
      archetype: 'Раненый воин'
    };

    const response = await generateVoiceResponse(params);
    console.log('   Voice generation:', response ? '✅ PASS' : '❌ FAIL');
    if (response) {
      console.log('   Generated response:');
      console.log('   ---');
      console.log('   ' + response.split('\n').join('\n   '));
      console.log('   ---');
    }
  } catch (error) {
    console.log('   Voice generation test failed:', error.message);
  }

  console.log('\n🎉 All core components tested!');
  console.log('Note: Database-dependent components (ritual memory, user archetypes) require a working database connection to test fully.');
}

runTests().catch(console.error);