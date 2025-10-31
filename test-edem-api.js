const { v4: uuidv4 } = require('uuid');

// Mock Supabase client for testing
const mockSupabase = {
  from: (table) => ({
    insert: (data) => ({
      select: () => Promise.resolve({ data: [{ ...data, id: uuidv4() }], error: null })
    }),
    select: () => ({
      eq: () => ({
        order: () => ({
          limit: () => Promise.resolve({ data: [], error: null })
        })
      })
    }),
    update: (data) => ({
      eq: () => Promise.resolve({ data: [{ ...data }], error: null })
    })
  })
};

// Mock the createServerSupabase function
jest.mock('./src/lib/supabase-server.ts', () => ({
  createServerSupabase: () => mockSupabase
}));

// Test the EdemLivingLLM core functionality
async function testEdemLivingLLM() {
  console.log('Testing EDEM Living LLM core functionality...');
  
  try {
    // Import the EdemLivingLLM class
    const { EdemLivingLLM } = require('./src/lib/edem-living-llm/core.ts');
    
    // Create an instance
    const edemLivingLLM = new EdemLivingLLM();
    
    // Test generateResponse method
    const response = await edemLivingLLM.generateResponse({
      message: 'Я чувствую тревогу и не могу сосредоточиться',
      sessionId: uuidv4(),
      stage: 'shadow',
      userId: uuidv4()
    });
    
    console.log('Generated response:', response);
    console.log('EDEM Living LLM core test completed successfully!');
    
    return true;
  } catch (error) {
    console.error('Error testing EDEM Living LLM core:', error);
    return false;
  }
}

// Test the emotion engine
async function testEmotionEngine() {
  console.log('Testing Emotion Engine...');
  
  try {
    // Import the EmotionEngine class
    const { EmotionEngine } = require('./src/lib/edem-living-llm/emotion-engine.ts');
    
    // Create an instance
    const emotionEngine = new EmotionEngine();
    
    // Test detectEmotion method
    const emotion = emotionEngine.detectEmotion('Я чувствую тревогу и не могу сосредоточиться');
    
    console.log('Detected emotion:', emotion);
    console.log('Emotion Engine test completed successfully!');
    
    return true;
  } catch (error) {
    console.error('Error testing Emotion Engine:', error);
    return false;
  }
}

// Test the scene engine
async function testSceneEngine() {
  console.log('Testing Scene Engine...');
  
  try {
    // Import the SceneEngine class
    const { SceneEngine } = require('./src/lib/edem-living-llm/scene-engine.ts');
    
    // Create an instance
    const sceneEngine = new SceneEngine();
    
    // Test selectScene method
    const scene = sceneEngine.selectScene('тревога', new Date());
    
    console.log('Selected scene:', scene);
    console.log('Scene Engine test completed successfully!');
    
    return true;
  } catch (error) {
    console.error('Error testing Scene Engine:', error);
    return false;
  }
}

// Test the ritual engine
async function testRitualEngine() {
  console.log('Testing Ritual Engine...');
  
  try {
    // Import the RitualEngine class
    const { RitualEngine } = require('./src/lib/edem-living-llm/ritual-engine.ts');
    
    // Create an instance
    const ritualEngine = new RitualEngine();
    
    // Test selectRitual method
    const ritual = ritualEngine.selectRitual('тревога', 'окно в темноте', []);
    
    console.log('Selected ritual:', ritual);
    console.log('Ritual Engine test completed successfully!');
    
    return true;
  } catch (error) {
    console.error('Error testing Ritual Engine:', error);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('Running comprehensive EDEM Living LLM tests...\n');
  
  const tests = [
    { name: 'Emotion Engine', fn: testEmotionEngine },
    { name: 'Scene Engine', fn: testSceneEngine },
    { name: 'Ritual Engine', fn: testRitualEngine },
    { name: 'EDEM Living LLM Core', fn: testEdemLivingLLM }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        console.log(`✅ ${test.name} PASSED\n`);
        passed++;
      } else {
        console.log(`❌ ${test.name} FAILED\n`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name} FAILED with error: ${error.message}\n`);
      failed++;
    }
  }
  
  console.log(`\nTest Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('🎉 All EDEM Living LLM tests passed!');
  } else {
    console.log('⚠️  Some tests failed. Please check the implementation.');
  }
}

// Run the tests
runAllTests().catch(console.error);