# AI Chatbot
This is a web-based AI Chatbot built with Python, Flask, JavaScript, and Supabase. It receives user questions as input and generates a text-based output. 
It also contains functionalities that allow new chat creation, supports user authentication, persistent conversation history and it also provides the user with three API provider options: Groq, Gemini and OpenRouter.

# Features

- Multiple AI providers: Interact with AI models through Groq, Google Gemini, and OpenRouter.

- Email OTP authentication: Sign in using a magic link

- Persistent conversations: Store chat conversations and messages in Supabase.

- Conversation history: Retrieve previously saved conversations.

- Conversation management: Start new chats and select an AI provider.

- Responsive interface: Chat through a browser-based interface.y

# Technology Stack

|Technology|Purpose|

|Python|Backend programming|

|Flask|Web framework and API routes|

|JavaScript|Frontend interactions|

|HTML/CSS|User interface and styling|

|Supabase Auth|User authentication|

|Supabase PostgreSQL|Conversation and message storage|

|Groq|AI inference|

|Google Gemini|AI inference|

|OpenRouter|Access to AI models|

|Render|Application hosting|

# Installation
## Getting Started

### 1. Clone the repository:

```bash
git clone https://github.com/GbosiSophia/ai-chatbot
```
cd AI-Chatbot

### 2. Create a virtual environment
```bash
python -m venv venv
```
Activate it:

Windows:

venv\Scripts\activate

macOS/Linux:

source venv/bin/activate

### 3. Install dependencies

```bash
pip install -r requirements.txt
```
### 4. Configure environment variables

Create a .env file in the project root:

GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=your_openrouter_model_id

Only configure the providers you intend to use. Never commit your .env file or expose private API keys.

### 5. Configure Supabase

Create a Supabase project.

Create the conversations and messages tables.

Enable Row Level Security (RLS).

Configure policies so users can only access their own conversations and messages.

Configure email magic link authentication.

Set the Supabase project URL and publishable key in the frontend configuration.

6. Run the application
```bash
python app.py
```
Open:
```bash
http://127.0.0.1:5000
```
## Database Structure

- conversations

Stores individual chat conversations.

- id: Unique conversation identifier.

- user_id: ID of the authenticated user.

- title: Conversation title.

- provider: Selected AI provider.

- created_at: Creation timestamp.

- updated_at: Last update timestamp.

- messages

Stores messages associated with conversations.

- id: Unique message identifier.

- conversation_id: Associated conversation.

- role: Message sender (user or assistant).

- content: Message content.

- created_at: Message timestamp.

- Each conversation can contain multiple messages.

##Environment Variables

|Variable|Purpose|

|GROQ_API_KEY|Groq API authentication|

|GEMINI_API_KEY|Google Gemini API authentication|

|OPENROUTER_API_KEY|OpenRouter API authentication|

|OPENROUTER_MODEL|OpenRouter model identifier|

The Supabase URL and publishable key are configured in the frontend. The publishable key is designed for client-side use; database security must be enforced with RLS policies.

##Deployment

The application can be deployed on Render using a Python web service.

Typical start command:
```bash
gunicorn app:app
```
Configure the required environment variables in the Render dashboard before deploying.

Future Improvements

- Secure backend authentication for protected API routes.

- Improved conversation search and management.

- Streaming AI responses.

- Better error handling and loading states.

- Additional AI provider integrations.

-Image generation

## How to Run the Application

### Option 1: Use the Live Application

Visit: `https://ai-chatbot-6jqt.onrender.com/index`

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
AI-Chatbot/
├── app.py
├── requirements.txt
├── templates/
│   ├── index.html
│   └── login.html
├── static/
│   ├── app.js
│   ├── style.css
│   └── css/
│       └── login.css
├── .env
├── .gitignore
└── README.md
```

## Author

Sophia Torbari Gbosi
