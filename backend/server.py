from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
import os
import requests

load_dotenv()

HF_API_KEY = os.getenv("HF_API_KEY")
HF_MODEL = os.getenv("HF_MODEL")

if not HF_API_KEY or not HF_MODEL:
    raise RuntimeError("Missing HF_API_KEY or HF_MODEL in .env")

API_URL = "https://router.huggingface.co/v1/chat/completions"

app = Flask(__name__, static_folder="../Frontend", static_url_path="/")
CORS(app)

@app.route("/")
def home():
    return send_from_directory(app.static_folder, "index.html")

@app.route("/<path:path>")
def static_files(path):
    return send_from_directory(app.static_folder, path)

@app.route("/api/generate", methods=["POST"])
def generate():
    prompt = request.json.get("prompt", "")

    headers = {
        "Authorization": f"Bearer {HF_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": HF_MODEL,
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "max_tokens": 200
    }

    resp = requests.post(API_URL, headers=headers, json=payload)
    print("HF RAW RESPONSE:", resp.status_code, resp.text)

    if resp.status_code != 200:
        return jsonify({"error": resp.text}), 500

    result = resp.json()
    text = result["choices"][0]["message"]["content"]

    return jsonify({"text": text})

if __name__ == "__main__":
    app.run(port=5000)
