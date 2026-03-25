const { HfInference } = require('@huggingface/inference');

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Denied" };

  try {
    const { topic, tone } = JSON.parse(event.body);
    const hf = new HfInference(process.env.HUGGINGFACE_TOKEN);

    // Swapping to Mistral 7B - No permission required!
    const response = await hf.chatCompletion({
      model: "mistralai/Mistral-7B-Instruct-v0.3",
      messages: [
        { 
          role: "system", 
          content: `You are the core engine of Axion-AI. Create a cinematic movie pitch. 
          Format: Logline, Setting, Protagonist, Inciting Incident, Narrative Summary, Final Shot. 
          Tone: ${tone}. Keep it under 180 words.` 
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
    return { statusCode: 500, body: JSON.stringify({ error: "Axion Engine Error: " + e.message }) };
  }
};
