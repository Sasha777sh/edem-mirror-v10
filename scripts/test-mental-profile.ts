import { generatePrompt } from '../src/lib/edem/promptEngine';

// Test the enhanced prompt engine with mental profiling
async function testMentalProfile() {
  console.log('Testing EDEM Prompt Engine with Mental Profiling...\n');
  
  // Test case 1: Loneliness with spiritual seeker archetype
  const lonelinessPrompt = generatePrompt({
    stage: 'shadow',
    voice: 'soft',
    archetype: 'mystic',
    input: 'Жена ушла, я страдаю. Хочу вернуть. Все пусто внутри.',
    memory: []
  });
  
  console.log('=== Test Case 1: Loneliness with Mystic Archetype ===');
  console.log(lonelinessPrompt);
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test case 2: Anger with warrior archetype
  const angerPrompt = generatePrompt({
    stage: 'truth',
    voice: 'hard',
    archetype: 'warrior',
    input: 'Меня бесит, что она ушла! Я боролся за нашу семью!',
    memory: []
  });
  
  console.log('=== Test Case 2: Anger with Warrior Archetype ===');
  console.log(angerPrompt);
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test case 3: Analytical with sage archetype
  const analyticalPrompt = generatePrompt({
    stage: 'integration',
    voice: 'therapist',
    archetype: 'sage',
    input: 'Хочу понять причины расставания. Какова была моя роль в этом?',
    memory: []
  });
  
  console.log('=== Test Case 3: Analytical with Sage Archetype ===');
  console.log(analyticalPrompt);
  console.log('\n' + '='.repeat(50) + '\n');
}

testMentalProfile().catch(console.error);