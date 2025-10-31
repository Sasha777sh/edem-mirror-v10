// Simple test to verify the API endpoint works
async function testPromptAPI() {
  console.log('Testing EDEM Prompt API...\n');
  
  try {
    // Test case 1: Anxiety input
    const response1 = await fetch('http://localhost:3000/api/edem/prompt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        stage: 'shadow',
        voice: 'soft',
        archetype: 'seeker',
        input: 'Я чувствую тревогу и страх перед будущим',
        memory: []
      })
    });
    
    const data1 = await response1.json();
    console.log('=== Test Case 1: Anxiety Input ===');
    console.log('Status:', response1.status);
    console.log('Prompt:', data1.prompt);
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test case 2: Shame input
    const response2 = await fetch('http://localhost:3000/api/edem/prompt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        stage: 'truth',
        voice: 'hard',
        archetype: 'warrior',
        input: 'Мне стыдно за то, что я сказал в момент гнева',
        memory: []
      })
    });
    
    const data2 = await response2.json();
    console.log('=== Test Case 2: Shame Input ===');
    console.log('Status:', response2.status);
    console.log('Prompt:', data2.prompt);
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test case 3: Error case (missing input)
    const response3 = await fetch('http://localhost:3000/api/edem/prompt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        invalid: 'data'
      })
    });
    
    const data3 = await response3.json();
    console.log('=== Test Case 3: Error Handling ===');
    console.log('Status:', response3.status);
    console.log('Response:', data3);
    console.log('\n' + '='.repeat(50) + '\n');
    
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

// Run the test
testPromptAPI();