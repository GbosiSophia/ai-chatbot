const SUPABASE_URL = 'https://ntjbtrfylevgokiosnob.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_03nE9ZE6DmPWBi9OfHd4Tg_7N-pSLCd';
//Create a Supabase client instance
const supabaseClient = window.supabase.createClient(
                                    SUPABASE_URL, 
                                    SUPABASE_ANON_KEY);

// DOM References
const sendButton = document.querySelector("#send-button");
const userInput = document.querySelector("#user-input");
const chatReply = document.querySelector("#response-box");
const newChatButton = document.querySelector("#new-chat");
const chatList = document.querySelector("#chat-list");
const modelSelect = document.querySelector("#model-select");

//Currently selected conversation ID 
let activeChatId = null;

//Currently authenticated user session
let currentSession = null;

//Authentication guard: Check if the user is authenticated, if not redirect to login page

async function requireAuth() {
    const { data, error } = await supabaseClient.auth.getSession();

    if (error || !data.session) {
        window.location.href = "/login";
        return null;
    }

    currentSession = data.session;

    return currentSession;
}


//Create a new conversation in the database
async function createNewChat() {
    const { data: newChat, error } = await supabaseClient
        .from("conversations")
        .insert({
            user_id: currentSession.user.id,
            title: "New Chat",
            provider: modelSelect.value
        })
        .select()
        .single();

    if (error) {
        console.error("Failed to create chat:", error);
        return;
    }

    activeChatId = newChat.id;

    await renderChatHistory();
    await renderActiveChat();

    userInput.value = "";
    userInput.focus();
}

//Load conversation list into the sidebar
async function renderChatHistory() {
    chatList.innerHTML = "";

    const { data: chats, error } = await supabaseClient
        .from("conversations")
        .select("id, title")
        .order("updated_at", { ascending: false });

    if (error) {
        console.error("Failed to load chat history:", error);
        return;
    }

    chats.forEach(chat => {
        const item = document.createElement("li");
        const button = document.createElement("button");

        button.type = "button";
        button.textContent = chat.title;

        if (chat.id === activeChatId) {
            button.classList.add("active-chat");
        }

        button.addEventListener("click", async () => {
            activeChatId = chat.id;

            const { data: convo } = await supabaseClient
                .from("conversations")
                .select("provider")
                .eq("id", chat.id)
                .single();

            if (convo && convo.provider) {
                modelSelect.value = convo.provider;
            }

            await renderChatHistory();
            await renderActiveChat();
        });

        item.appendChild(button);
        chatList.appendChild(item);
    });
}

// Render the selected conversation's messages.
async function renderActiveChat() {
    chatReply.innerHTML = "";

    if (!activeChatId) {
        return;
    }

    const { data: messages, error } = await supabaseClient
        .from("messages")
        .select("role, content")
        .eq("conversation_id", activeChatId)
        .order("created_at", { ascending: true });

    if (error) {
        console.error("Failed to load messages:", error);
        return;
    }

    messages.forEach(message => {
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

// Send a message: save user msg -> call Flask -> save AI msg

async function sendMessage() {
    const message = userInput.value.trim();

    if (!message) {
        return;
    }

    // Create a conversation on the fly if none is active
    if (!activeChatId) {
        const { data: newChat, error } = await supabaseClient
            .from("conversations")
            .insert({
                user_id: currentSession.user.id,
                title: message.length > 35
                    ? message.slice(0, 35) + "..."
                    : message,
                provider: modelSelect.value
            })
            .select()
            .single();

        if (error) {
            console.error("Failed to create chat:", error);
            return;
        }

        activeChatId = newChat.id;
    }

    // Update the conversation's provider
    await supabaseClient
        .from("conversations")
        .update({
            provider: modelSelect.value,
            updated_at: new Date().toISOString()
        })
        .eq("id", activeChatId);

    // Save the user message
    const { error: userMsgError } = await supabaseClient
        .from("messages")
        .insert({
            conversation_id: activeChatId,
            role: "user",
            content: message
        });

    if (userMsgError) {
        console.error("Failed to save user message:", userMsgError);
        return;
    }

    // Set the title from the first user message if it's still "New Chat"
    const { data: convo } = await supabaseClient
        .from("conversations")
        .select("title")
        .eq("id", activeChatId)
        .single();

    if (convo && convo.title === "New Chat") {
        await supabaseClient
            .from("conversations")
            .update({
                title: message.length > 35
                    ? message.slice(0, 35) + "..."
                    : message
            })
            .eq("id", activeChatId);
    }

    userInput.value = "";
    await renderActiveChat();
    await renderChatHistory();

    sendButton.disabled = true;

    try {
        const response = await fetch("/process", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user_input: message,
                provider: modelSelect.value
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `HTTP error: ${response.status}`);
        }

        // Save the AI reply
        await supabaseClient.from("messages").insert({
            conversation_id: activeChatId,
            role: "assistant",
            content: data.response
        });

        await renderActiveChat();
        await renderChatHistory();

    } catch (error) {
        console.error("Chat request failed:", error);

        // Persist the error so it's visible after refresh
        await supabaseClient.from("messages").insert({
            conversation_id: activeChatId,
            role: "assistant",
            content: `Sorry, the request failed: ${error.message}`
        });

        await renderActiveChat();

    } finally {
        sendButton.disabled = false;
        userInput.focus();
    }
}

// Event Listeners
sendButton.addEventListener("click", sendMessage);
newChatButton.addEventListener("click", createNewChat);

// Press Enter to send (Shift+Enter for newline)
userInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
});

// Sign-out button (see note below — you need to add it to index.html)
const logoutButton = document.querySelector("#logout-button");
if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
        await supabaseClient.auth.signOut();
        window.location.href = "/login";
    });
}

// Bootstrap: require auth, then restore latest conversation

(async function init() {
    const session = await requireAuth();

    if (!session) {
        return; // redirect happened
    }

    await renderChatHistory();

    // Restore the most recent conversation, or create one
    const { data: latestChats } = await supabaseClient
        .from("conversations")
        .select("id, provider")
        .order("updated_at", { ascending: false })
        .limit(1);

    if (latestChats && latestChats.length > 0) {
        activeChatId = latestChats[0].id;

        if (latestChats[0].provider) {
            modelSelect.value = latestChats[0].provider;
        }

        await renderActiveChat();
    } else {
        await createNewChat();
    }
})();
