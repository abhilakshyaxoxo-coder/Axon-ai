export async function handler(event) {
  const { topic, tone } = JSON.parse(event.body);

  const prompt = `
You are a cinematic AI writer.

Convert the topic "${topic}" into a short screenplay scene.

Rules:
- Use proper screenplay format
- Include scene heading (INT./EXT.)
- Include dialogue
- Keep explanation natural, not textbook
- Tone: ${tone}
- Be clear, avoid hallucination, stay relevant
`;

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 500,
            temperature: 0.7
          }
        })
      }
    );

    const data = await response.json();

    const result = data[0]?.generated_text || "Failed to generate.";

    return {
      statusCode: 200,
      body: JSON.stringify({ result })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ result: "Server error." })
    };
  }
      }
