
import os

from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
from groq import Groq
from google import genai
from openai import OpenAI

load_dotenv()

app = Flask(__name__)

# Configure API clients
groq_key = os.getenv("GROQ_API_KEY")
gemini_key = os.getenv("GEMINI_API_KEY")
openrouter_key = os.getenv("OPENROUTER_API_KEY")
openrouter_model = os.getenv("OPENROUTER_MODEL")

openrouter_client = (
    OpenAI(
        api_key=openrouter_key,
        base_url="https://openrouter.ai/api/v1"
    )
    if openrouter_key
    else None
)

groq_client = Groq(api_key=groq_key) if groq_key else None
gemini_client = genai.Client(api_key=gemini_key) if gemini_key else None

SYSTEM_PROMPT = """
You are a helpful AI assistant.
Format your answers for easy reading.

Follow these rules:
1. Use clear headings when appropriate.
2. Use bullet points for lists.
3. Use numbered steps for instructions.
4. Keep paragraphs short.
5. Use simple language.
6. Avoid unnecessary repetition.
7. Use examples when helpful.
"""


def generate_response(user_input, provider):
    if provider == "groq":
        if groq_client is None:
            raise ValueError("Groq API key is not configured.")

        response = groq_client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_input}
            ]
        )

        return response.choices[0].message.content

    elif provider == "gemini":
        if gemini_client is None:
            raise ValueError("Gemini API key is not configured.")

        response = gemini_client.models.generate_content(
            model="models/gemini-3.1-flash-lite",
            contents=f"{SYSTEM_PROMPT}\n\nUser: {user_input}"
        )

        return response.text

    elif provider == "openrouter":
        if openrouter_client is None:
            raise ValueError("OpenRouter API key is not configured.")

        if not openrouter_model:
            raise ValueError("OpenRouter model is not configured.")

        response = openrouter_client.chat.completions.create(
            model=openrouter_model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_input}
            ]
        )
        return response.choices[0].message.content

    else:
        raise ValueError("Unsupported AI provider.")


@app.route("/")
@app.route("/index")
def index():
    return render_template("index.html")


@app.route("/process", methods=["POST"])
def process():
    try:
        data = request.get_json(silent=True) or {}

        user_input = data.get("user_input", "").strip()
        provider = data.get("provider", "groq").lower()

        if not user_input:
            return jsonify({"error": "Please enter a message."}), 400

        if provider not in ("groq", "gemini","openrouter"):
            return jsonify({"error": "Unsupported AI provider."}), 400

        response = generate_response(user_input, provider)

        return jsonify({"response": response})

    except ValueError as error:
        return jsonify({"error": str(error)}), 400

    except Exception:
        app.logger.exception("Error processing chatbot request")

        return jsonify({
            "error": "The AI request failed. Please try again."
        }), 500


if __name__ == "__main__":
    app.run(debug=True)
