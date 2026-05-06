const axios = require('axios');

async function testGemini() {
  const apiKey = 'AIzaSyC4uzlMRmnLTh75xAGVHFFeRZ2SKe7dRsY';
  const model = 'gemini-flash-latest';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  try {
    const response = await axios.post(url, {
      contents: [{
        parts: [{ text: 'Hello, how are you?' }]
      }],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });
    console.log('Success:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testGemini();
