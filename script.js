const btn = document.getElementById("generateBtn");
const output = document.getElementById("output");
const copyBtn = document.getElementById("copyBtn");

// ⚠️ Paste your (temporary) token here
const API_KEY = "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";

btn.addEventListener("click", async () => {
  const topic = document.getElementById("topic").value.trim();
  const tone = document.getElementById("tone").value;

  if (!topic) {
    output.textContent = "Enter a topic first.";
    return;
  }

  output.textContent = "Generating... (first run may take 10–20s)";

  const prompt = `
You are a cinematic screenplay writer.

Write a short scene explaining "${topic}" in a ${tone} tone.

Rules:
- Use INT./EXT. scene heading
- Include character dialogue
- Keep it engaging and clear
- Avoid vague or random content
`;

  try {
    const res = await fetch("https://corsproxy.io/?https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 400,
            temperature: 0.7
          }
        })
      }
    );

    const data = await res.json();
    console.log("HF RESPONSE:", data);

    let result = "Failed to generate.";

    if (Array.isArray(data)) {
      result = data[0]?.generated_text || result;
    } else if (data.generated_text) {
      result = data.generated_text;
    } else if (data.error) {
      result = "Error: " + data.error;
    }

    output.textContent = result;

  } catch (err) {
    console.error(err);
    output.textContent = "Network error. Try again.";
  }
});

copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(output.textContent);
});
