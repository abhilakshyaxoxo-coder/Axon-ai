const { HfInference } = require('@huggingface/inference');

exports.handler = async (event) => {
  // 1. Only allow POST requests (security)
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    // 2. Grab the topic and tone from your website's front-end
    const { topic, tone } = JSON.parse(event.body);
    
    // 3. Connect to Hugging Face using your secret token
    const hf = new HfInference(process.env.HUGGINGFACE_TOKEN);

    // 4. The AI Configuration (This is the JSON that was in the wrong place!)
    const response = await hf.chatCompletion({
      model: "mistralai/Mistral-7B-Instruct-v0.3",
      messages: [
        { 
          role: "system", 
          content: "You are the Axion-AI screenwriter. Create a cinematic movie pitch with: Logline, Setting, Protagonist, and Story Summary." 
        },
        { 
          role: "user", 
          content: `Topic: ${topic}, Tone: ${tone}` 
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    // 5. Send the AI's answer back to your website
    return {
      statusCode: 200,
      body: JSON.stringify({ pitch: response.choices[0].message.content })
    };

  } catch (error) {
    // 6. If something breaks, tell us exactly what happened
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Axion Engine Error: " + error.message })
    };
  }
};
