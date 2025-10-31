import { EdemLivingLLM } from './src/lib/edem-living-llm/core';
import { createServerSupabase } from './src/lib/supabase-server';

async function testEdemLivingLLM() {
  console.log('Testing EDEM Living LLM components...');

  // Create a test instance
  const edemLivingLLM = new EdemLivingLLM();

  // Test emotion detection
  const testMessage = "Я чувствую тревогу и не могу сосредоточиться";
  console.log(`Testing with message: "${testMessage}"`);

  try {
    // Test generateResponse method
    const response = await edemLivingLLM.generateResponse({
      userInput: testMessage,
      sessionId: 'test-session-id',
      stage: 'shadow',
      userId: 'test-user-id'
    });

    console.log('Generated response:', response);
    console.log('EDEM Living LLM test completed successfully!');
  } catch (error) {
    console.error('Error testing EDEM Living LLM:', error);
  }
}

// Run the test
testEdemLivingLLM().catch(console.error);