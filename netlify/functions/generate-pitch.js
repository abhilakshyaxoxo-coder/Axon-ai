const { Together } = require('together-ai');

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };
  try {
    const { topic, tone } = JSON.parse(event.body);
    const client = new Together({ apiKey: process.env.TOGETHER_API_KEY });

    const result = await client.chat.completions.create({
      model: "meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8",
      messages: [
        { role: "system", content: "You are a world-class Screenwriter. Adapt the topic into a cinematic pitch. Tone: " + tone },
        { role: "user", content: "Topic: " + topic }
      ],
      max_tokens: 400
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ pitch: result.choices[0].message.content })
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};

