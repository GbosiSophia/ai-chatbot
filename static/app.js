//Selecting the button 
const sendButton = document.querySelector("#send-button");
const userInput = document.querySelector("#user-input");
const chatReply = document.querySelector("#response-box");

//Listening for when the user clicks the button
sendButton.addEventListener("click", async () => {
    //To read the current value of the input field
    const message = userInput.value;

    if (!message.trim()) {
        return;
    }

    try {
        //Sending the input to the server
        const response = await fetch("/process", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user_input: message
            })
        });

        //Parsing the response from the server
        const data = await response.json();
        //Displaying the response in the chat reply box
        chatReply.innerHTML = DOMPurify.sanitize(
            marked.parse(data.response)
        );
    } catch (error) {
        console.error("Error:", error);

        chatReply.textContent = "An error occurred while processing your request.";
    }
}); 
