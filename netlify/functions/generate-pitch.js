const { HfInference } = require('@huggingface/inference');

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { topic, tone } = JSON.parse(event.body);
    
    // This connects to the token you saved in Netlify
    const hf = new HfInference(process.env.HUGGINGFACE_TOKEN);

    const response = await hf.chatCompletion({
      model: "meta-llama/Meta-Llama-3-8B-Instruct",
      messages: [
        { 
          role: "system", 
          content: `You are a cinematic screenwriter. Adapt the academic topic into a professional movie pitch. 
          Format with headers: Logline, Setting, Protagonist, Inciting Incident, Narrative Summary, Final Shot. 
          Tone: ${tone}. Max 180 words.` 
        },
        { role: "user", content: `Topic: ${topic}` }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ pitch: response.choices[0].message.content })
    };
  } catch (e) {
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: "HF Brain Error: " + e.message }) 
    };
  }
};
