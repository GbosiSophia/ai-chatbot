
const sendButton = document.querySelector("#send-button");
const userInput = document.querySelector("#user-input");
const chatReply = document.querySelector("#response-box");
const newChatButton = document.querySelector("#new-chat");
const chatList = document.querySelector("#chat-list");
const modelSelect = document.querySelector("#model-select");

// Restore saved conversations from the browser.
let conversations = JSON.parse(
    localStorage.getItem("conversations") || "{}"
);

let activeChatId = localStorage.getItem("activeChatId");

function saveChats() {
    localStorage.setItem(
        "conversations",
        JSON.stringify(conversations)
    );

    localStorage.setItem("activeChatId", activeChatId || "");
}

// Create a new conversation.
function createNewChat() {
    const chatId = crypto.randomUUID();

    conversations[chatId] = {
        id: chatId,
        title: "New Chat",
        messages: [],
        provider: modelSelect.value
    };

    activeChatId = chatId;

    saveChats();
    renderChatHistory();
    renderActiveChat();

    userInput.value = "";
    userInput.focus();
}

// Display conversation titles in the sidebar.
function renderChatHistory() {
    chatList.innerHTML = "";

    Object.values(conversations).reverse().forEach(chat => {
        const item = document.createElement("li");
        const button = document.createElement("button");

        button.type = "button";
        button.textContent = chat.title;

        if (chat.id === activeChatId) {
            button.classList.add("active-chat");
        }

        button.addEventListener("click", () => {
            activeChatId = chat.id;
            modelSelect.value = chat.provider || "groq";

            saveChats();
            renderChatHistory();
            renderActiveChat();
        });

        item.appendChild(button);
        chatList.appendChild(item);
    });
}

// Render the selected conversation's messages.
function renderActiveChat() {
    chatReply.innerHTML = "";

    const chat = conversations[activeChatId];

    if (!chat) {
        return;
    }

    chat.messages.forEach(message => {
        const messageElement = document.createElement("div");
        messageElement.className = `message ${message.role}`;

        if (message.role === "assistant") {
            messageElement.innerHTML = DOMPurify.sanitize(
                marked.parse(message.content)
            );
        } else {
            messageElement.textContent = message.content;
        }

        chatReply.appendChild(messageElement);
    });
}

// Send a message and save both sides of the conversation.
async function sendMessage() {
    const message = userInput.value.trim();

    if (!message) {
        return;
    }

    if (!activeChatId || !conversations[activeChatId]) {
        createNewChat();
    }

    const chat = conversations[activeChatId];

    // Remember which provider this conversation uses.
    chat.provider = modelSelect.value;

    // Use the first user message as the chat title.
    if (chat.messages.length === 0) {
        chat.title = message.length > 35
            ? message.slice(0, 35) + "..."
            : message;
    }

    chat.messages.push({
        role: "user",
        content: message
    });

    userInput.value = "";
    renderActiveChat();
    saveChats();
    renderChatHistory();

    sendButton.disabled = true;

    try {
        const response = await fetch("/process", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user_input: message,
                provider: chat.provider
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `HTTP error: ${response.status}`);
        }

        chat.messages.push({
            role: "assistant",
            content: data.response
        });

        renderActiveChat();
        saveChats();

    } catch (error) {
        console.error("Chat request failed:", error);

        chat.messages.push({
            role: "assistant",
            content: `Sorry, the request failed: ${error.message}`
        });

        renderActiveChat();
        saveChats();

    } finally {
        sendButton.disabled = false;
        userInput.focus();
    }
}

sendButton.addEventListener("click", sendMessage);
newChatButton.addEventListener("click", createNewChat);

// Restore the previous chat or create the first one.
if (activeChatId && conversations[activeChatId]) {
    modelSelect.value = conversations[activeChatId].provider || "groq";
    renderChatHistory();
    renderActiveChat();
} else {
    createNewChat();
}
