# AI Chatbot
This is an AI Chatbot that collects user questions as input and generates a text-based output.

# Tools & Frameworks
-Python(Flask)
-HTML
-JavaScript
-CSS
-Groq API
-Request

## Installation

Clone the repository:

```bash
git clone https://github.com/GbosiSophia/ai-chatbot
```

Install dependencies:

```bash
pip install -r requirements.txt
```

## How to Run the Application

### Option 1: Use the Live Application

Visit: `https://ai-chatbot-6jqt.onrender.com/`

Replace this URL with your actual Render URL.

### Option 2: Run Locally

1. Clone the repository:

   ```bash
   git clone "https://github.com/GbosiSophia/ai-chatbot"
   ```

2. Navigate to the project directory:

   ```bash
   cd "AI Chatbot"
   ```

3. Install the dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the project root and add your Groq API key:

   ```text
   GROQ_API_KEY=your_groq_api_key
   ```

5. Start the Flask application:

   ```bash
   python app.py
   ```

6. Open `http://127.0.0.1:5000/index` in your browser.

**Note:** Keep your API key private. Never commit your `.env` file to GitHub.


## Project Structure

```
app.py
requirements.txt
static/
templates/
README.md
```

## Author

Sophia Torbari Gbosi
