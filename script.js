const btn = document.getElementById("generateBtn");
const output = document.getElementById("output");
const copyBtn = document.getElementById("copyBtn");

btn.addEventListener("click", async () => {
  const topic = document.getElementById("topic").value;
  const tone = document.getElementById("tone").value;

  if (!topic) {
    output.textContent = "Enter a topic first.";
    return;
  }

  output.textContent = "Generating...";

  try {
    const res = await fetch("/.netlify/functions/generate", {
      method: "POST",
      body: JSON.stringify({ topic, tone })
    });

    const data = await res.json();
    output.textContent = data.result;

  } catch (err) {
    output.textContent = "Error generating output.";
  }
});

copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(output.textContent);
});
