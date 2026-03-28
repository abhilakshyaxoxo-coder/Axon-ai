from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
import time

app = Flask(__name__)
CORS(app)

HF_API_KEY = os.environ.get("HF_API_KEY")

if not HF_API_KEY:
    raise ValueError("HF_API_KEY not set in environment variables")

API_URL = "https://api-inference.huggingface.co/models/Qwen/Qwen2.5-7B-Instruct"

HEADERS = {
    "Authorization": f"Bearer {HF_API_KEY}",
    "Content-Type": "application/json"
}

# ---------------- PROMPT BUILDER ---------------- #

def build_prompt(topic, genre, tone):
    return f"""
You are a highly skilled cinematic writer with strong scientific reasoning.

TASK:
Convert the academic concept "{topic}" into a {genre} cinematic screenplay scene.

TONE:
{tone}

GOALS:
- Be creative, but stay logically grounded in the concept
- Avoid hallucinations or false scientific claims
- Do not drift into unrelated storytelling
- Explain the concept through actions and dialogue, not exposition

FORMAT RULES:
- Start with a scene heading (INT./EXT.)
- Include action descriptions
- Use character names in CAPS
- Include dialogue that naturally conveys the concept

IMPORTANT:
If uncertain about a detail, simplify instead of inventing false facts.

OUTPUT:
Only return the screenplay. No explanations.
"""

# ---------------- MODEL CALL ---------------- #

def call_model(prompt):
    payload = {
        "inputs": prompt,
        "parameters": {
            "max_new_tokens": 700,
            "temperature": 0.7,
            "return_full_text": False
        }
    }

    try:
        response = requests.post(API_URL, headers=HEADERS, json=payload, timeout=30)

        if response.status_code != 200:
            print("HF ERROR:", response.text)
            return None

        data = response.json()

        if isinstance(data, list) and "generated_text" in data[0]:
            return data[0]["generated_text"]

        return None

    except requests.exceptions.RequestException as e:
        print("REQUEST ERROR:", str(e))
        return None

# ---------------- CRITIC LAYER ---------------- #

def critic_layer(script, topic):
    if not script:
        return None, 0

    score = 0

    # Structure check
    if "INT." in script or "EXT." in script:
        score += 2

    # Dialogue presence
    if script.count("\n") > 8:
        score += 1

    # Topic relevance (basic keyword check)
    topic_words = topic.lower().split()
    matches = sum(1 for word in topic_words if word in script.lower())

    if matches >= 1:
        score += 2

    # Noise detection (very basic heuristic)
    if len(script.split()) < 150:
        score -= 1

    return script, score

# ---------------- REFINEMENT ---------------- #

def refine_output(original_prompt, script):
    refine_prompt = f"""
The following screenplay is weak or partially incorrect:

{script}

Improve it by:
- Increasing clarity
- Fixing scientific inaccuracies
- Strengthening structure

Keep creativity, but remove noise.

Return only the improved screenplay.
"""

    return call_model(refine_prompt)

# ---------------- MAIN PIPELINE ---------------- #

def generate_pipeline(topic, genre, tone):
    prompt = build_prompt(topic, genre, tone)

    script = call_model(prompt)

    script, score = critic_layer(script, topic)

    # Retry logic (simple but effective)
    if score < 3:
        print("Low score, refining...")
        improved = refine_output(prompt, script)

        if improved:
            script, new_score = critic_layer(improved, topic)

            if new_score > score:
                script = improved

    return script

# ---------------- API ROUTE ---------------- #

@app.route("/api/generate", methods=["POST"])
def generate():
    data = request.json

    topic = data.get("topic")
    genre = data.get("genre")
    tone = data.get("tone")

    if not topic:
        return jsonify({"error": "Topic is required"}), 400

    result = generate_pipeline(topic, genre, tone)

    if result:
        return jsonify({"script": result})
    else:
        return jsonify({"error": "Generation failed"}), 500

# ---------------- RUN ---------------- #

if __name__ == "__main__":
    app.run(debug=True, port=5000)
