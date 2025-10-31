import { generatePrompt } from '../src/lib/edem/promptEngine';

// Test the prompt engine
async function testPromptEngine() {
  console.log('Testing EDEM Prompt Engine...\n');
  
  // Test case 1: Anxiety input
  const anxietyPrompt = generatePrompt({
    stage: 'shadow',
    voice: 'soft',
    archetype: 'seeker',
    input: 'Я чувствую тревогу и страх перед будущим',
    memory: []
  });
  
  console.log('=== Test Case 1: Anxiety Input ===');
  console.log(anxietyPrompt);
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test case 2: Shame input
  const shamePrompt = generatePrompt({
    stage: 'truth',
    voice: 'hard',
    archetype: 'warrior',
    input: 'Мне стыдно за то, что я сказал в момент гнева',
    memory: []
  });
  
  console.log('=== Test Case 2: Shame Input ===');
  console.log(shamePrompt);
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test case 3: Neutral input
  const neutralPrompt = generatePrompt({
    stage: 'integration',
    voice: 'therapist',
    archetype: 'healer',
    input: 'Хочу поделиться своими размышлениями о прошедшей неделе',
    memory: []
  });
  
  console.log('=== Test Case 3: Neutral Input ===');
  console.log(neutralPrompt);
  console.log('\n' + '='.repeat(50) + '\n');
}

testPromptEngine().catch(console.error);