from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
from groq import Groq
import os

load_dotenv()
api_key = os.getenv("GROQ_API_KEY")
print("Current folder:", os.getcwd())
print("API KEY FOUND: ", api_key is not None)

client = Groq(api_key=api_key)

# Creating my Gemini function
def generate_response(user_input):

    response = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[{
                "role": "system",
                "content": """
                You are a helpful AI assistant.
                Format your answers for easy reading.

                Follow these rules:
                1. Use a clear heading when appropriate.
                2. Use bullet points for lists.
                3. Use numbered steps for instructions.
                4. Keep paragraphs short.
                5. Use simple language.
                6. Avoid unnecessary repetition.
                7. Use examples when they help explain a concept.
                """
            },
            {
            "role": "user",
            "content": user_input
        }]
    )

    return response.choices[0].message.content

app = Flask(__name__)

@app.route('/index')
def index():
    return render_template('index.html')

@app.route('/process', methods=['GET', 'POST'])
def process():
    try:
        # Get JSON data sent from javascript
        data = request.get_json()
        # Get the user's message from the JSON data
        user_input = data.get('user_input')

        print("User input:", user_input)

        # Process the user input and generate a response
        response = generate_response(user_input)

        # Sending the response back to java script
        return jsonify({
            'response': response
        })
    except Exception as e:
        print(f"Error processing input: {e}")
        return jsonify({
            "error": "An error occurred while processing your request."
            }), 500

if __name__ == '__main__':
    app.run(debug=True)