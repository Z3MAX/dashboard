// netlify/functions/gemini-chat.js
export default async (request, context) => {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { message } = await request.json();
    const apiKey = Netlify.env.get('GEMINI_API_KEY');
    
    if (!apiKey) {
      return new Response('API key not configured', { status: 500 });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: message
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return new Response(JSON.stringify({
        response: data.candidates[0].content.parts[0].text
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      throw new Error('Invalid API response');
    }
    
  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};