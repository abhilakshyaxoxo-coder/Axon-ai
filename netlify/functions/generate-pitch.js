const { HfInference } = require('@huggingface/inference');

exports.handler = async (event) => {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        const { topic, tone } = JSON.parse(event.body);
        
        // This client now automatically routes to the correct 2026 infrastructure
        const hf = new HfInference(process.env.HUGGINGFACE_TOKEN);

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

        return {
            statusCode: 200,
            body: JSON.stringify({ pitch: response.choices[0].message.content })
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Axion Engine Error: " + error.message })
        };
    }
};
