const chatbotToggler = document.querySelector(".chatbot-toggler");
const languageToggler = document.querySelector(".language-toggler");
const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");
const languageElement = document.querySelector("#txtLanguage");

let languageMap = {
    "en": "english",
    "no": "norwegian",
};
let currentLanguage = "en";

let userMessage = null;
const inputInitHeight = chatInput.scrollHeight;

const createChatLi = (message, className) => {
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", `${className}`);
    let chatContent = className === "outgoing" ? `<p></p>` : `<span class="material-symbols-outlined">smart_toy</span><p></p>`;
    chatLi.innerHTML = chatContent;
    chatLi.querySelector("p").textContent = message;
    return chatLi;
}

const generateResponse = (chatElement) => {
    const messageElement = chatElement.querySelector("p");
    const loaderElement = document.createElement("div");
    loaderElement.classList.add("loader");
    loaderElement.innerHTML = `
        <span></span>
        <span></span>
        <span></span>
    `;
    messageElement.textContent = '';
    messageElement.appendChild(loaderElement);
    const requestOptions = {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            user_chat: userMessage,
            language: languageMap[currentLanguage]
        })
    }

    const textarea = document.getElementById("chat-txt");
    textarea.disabled = true;
    fetch(`${API_URL}/v1/help-assistant/question`, requestOptions).then(res => res.json()).then(data => {
        textarea.disabled = false;
        messageElement.removeChild(loaderElement);
        messageElement.textContent = data.chat_response.trim();
    }).catch(() => {
        textarea.disabled = false;
        messageElement.removeChild(loaderElement);
        messageElement.classList.add("error");
        messageElement.textContent = "Oops! Something went wrong. Please try again.";
    }).finally(() => chatbox.scrollTo(0, chatbox.scrollHeight));
}

const handleChat = () => {
    userMessage = chatInput.value.trim();
    if(!userMessage) return;

    // Clear the input textarea and set its height to default
    chatInput.value = "";
    chatInput.style.height = `${inputInitHeight}px`;

    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    chatbox.scrollTo(0, chatbox.scrollHeight);
    
    setTimeout(() => {
        const incomingChatLi = createChatLi("Loading...", "incoming");
        chatbox.appendChild(incomingChatLi);
        chatbox.scrollTo(0, chatbox.scrollHeight);
        generateResponse(incomingChatLi);
    }, 600);
}


/**
 * Adjust the height of the input textarea based on its content
 */
chatInput.addEventListener("input", () => {
    chatInput.style.height = `${inputInitHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
    if(e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleChat();
    }
});

sendChatBtn.addEventListener("click", handleChat);
closeBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));
languageToggler.addEventListener("click", () => {
    document.body.classList.toggle("change-language")
    currentLanguage = currentLanguage === "en" ? "no" : "en";
    languageElement.textContent = `* ${currentLanguage}`;
});