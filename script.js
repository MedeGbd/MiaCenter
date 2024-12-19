class ChatMessage {
    constructor(text, isUser, language = 'es', id = Date.now()) {
        this.text = text;
        this.isUser = isUser;
        this.language = language;
        this.id = id;
        this.reactions = [];
    }
}

const chatMessagesDiv = document.getElementById('chat-messages');
const chatMessagesDiv2 = document.getElementById('chat-messages-2');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const clearChatButton = document.querySelector('.clear-chat-button');
const settingsButton = document.querySelector('.settings-button');
const settingsModal = document.getElementById('settings-modal');
const closeSettingsModal = document.getElementById('close-settings-modal');
const themeSelector = document.getElementById('theme-selector');
const fontSelector = document.getElementById('font-selector');
const languageSelector = document.getElementById('language-selector');
const translationSelector = document.getElementById('translation-selector');
const voiceButton = document.getElementById('voice-button');
const saveChatButton = document.querySelector('.save-chat-button');
const loadChatButton = document.querySelector('.load-chat-button');
const loadChatInput = document.getElementById('load-chat-input');
const searchInput = document.getElementById('search-input');
const tabButtons = document.querySelectorAll('.tab-button');
const addTabButton = document.getElementById('add-tab-button');
const loadingIndicator = document.getElementById('loading-indicator');
const apiKey = 'AIzaSyB67nQ8iixZePLp9JNj_1oEDn0TJSvkLso'; // Reemplaza con tu API Key
let chatHistory = {
    chat1: [],
    chat2: [],
};
let currentTab = 'chat1';
let isVoiceRecognitionActive = false;
let recognition;
let translations = {};
let currentLanguage = localStorage.getItem('chatLanguage') || 'es';
let tabCounter = 3;

function showLoadingIndicator(show, tabId = currentTab) {
    const loading = tabId === 'chat1' ? loadingIndicator : document.getElementById('loading-indicator-2');
    loading.style.display = show ? 'block' : 'none';
}

function loadChatHistory() {
    const storedHistory = localStorage.getItem('chatHistory');
    if (storedHistory) {
        chatHistory = JSON.parse(storedHistory);
        for (const tab in chatHistory) {
            chatHistory[tab].forEach(message => addMessageToChat(message, tab));
        }
    }
}

function saveChatHistory() {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
}

function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[key]) {
            element.textContent = translations[key];
        }
        if (key === 'inputPlaceholder') {
            element.placeholder = translations[key];
        }
        if (key === 'searchPlaceholder') {
            searchInput.placeholder = translations[key];
        }
    });
}

function addMessageToChat(message, tabId = currentTab) {
    const chatMessages = tabId === 'chat1' ? chatMessagesDiv : chatMessagesDiv2;
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    if (message.isUser) {
        messageDiv.classList.add('user-message');
        messageDiv.classList.add('user-message-color');
        messageDiv.innerHTML = `<span class="message-text">${message.text}</span>
                             <div class="message-actions">
                             <button class="edit-button" onclick="editMessage(this, '${message.id}', '${tabId}')"><i class="fas fa-edit"></i></button>
                            <button class="delete-button" onclick="deleteMessage('${message.id}', '${tabId}')"><i class="fas fa-trash"></i></button>
                             </div>`;
    } else {
        messageDiv.classList.add('gemini-message');
        messageDiv.classList.add('gemini-message-color');
        let translatedText = message.text;
        if (translationSelector.value === 'enabled' && message.language !== languageSelector.value) {
            translateText(message.text, message.language, languageSelector.value).then(translation => {
                translatedText = translation;
                messageDiv.innerHTML = `<span class="message-text">${translatedText}</span>
                                        <button class="copy-button" onclick="copyToClipboard(this)"><i class="fas fa-copy"></i></button>`;
            });
        } else {
            messageDiv.innerHTML = `<span class="message-text">${translatedText}</span>
                                        <button class="copy-button" onclick="copyToClipboard(this)"><i class="fas fa-copy"></i></button>`;
        }
    }
    const reactionButtons = createReactionButtons(message, tabId);
    messageDiv.appendChild(reactionButtons);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function createReactionButtons(message, tabId) {
    const reactionContainer = document.createElement('div');
    reactionContainer.classList.add('reaction-buttons');
    const reactions = ['👍', '❤️', '😂', '🤔'];
    reactions.forEach(emoji => {
        const button = document.createElement('button');
        button.textContent = emoji;
        button.addEventListener('click', () => addReaction(message, emoji, tabId));
        reactionContainer.appendChild(button);
    });
    return reactionContainer;
}

function addReaction(message, reaction, tabId) {
    const messageIndex = chatHistory[tabId].findIndex(msg => msg.id === message.id);
    if (messageIndex > -1) {
        const messageObj = chatHistory[tabId][messageIndex];
        if (!messageObj.reactions.includes(reaction)) {
            messageObj.reactions.push(reaction);
            const messageDiv = document.querySelector(`.chat-messages[data-tab="${tabId}"] .message .message-actions .delete-button[onclick="deleteMessage('${message.id}', '${tabId}')"]`).closest('.message');
            if (messageDiv) {
                updateReactionDisplay(messageDiv, messageObj);
                saveChatHistory();
            }
        }

    }
}

function updateReactionDisplay(messageDiv, message) {
    const existingReactions = messageDiv.querySelector('.reactions-display');
    if (existingReactions) {
        existingReactions.remove();
    }
    const reactionDisplay = document.createElement('div');
    reactionDisplay.classList.add('reactions-display');
    reactionDisplay.textContent = message.reactions.join('');
    messageDiv.appendChild(reactionDisplay);
}


function editMessage(button, messageId, tabId) {
    const chatMessages = tabId === 'chat1' ? chatMessagesDiv : chatMessagesDiv2;
    const messageDiv = button.closest('.message');
    const messageTextElement = messageDiv.querySelector('.message-text');
    const originalText = messageTextElement.textContent;

    const inputElement = document.createElement('input');
    inputElement.type = 'text';
    inputElement.value = originalText;
    messageTextElement.replaceWith(inputElement);
    inputElement.focus();
    inputElement.addEventListener('blur', () => {
        const newText = inputElement.value.trim();
        if (newText && newText !== originalText) {
            const messageIndex = chatHistory[tabId].findIndex(message => message.id === messageId);
            if (messageIndex > -1) {
                chatHistory[tabId][messageIndex].text = newText;
                saveChatHistory();
                messageTextElement.textContent = newText;
                inputElement.replaceWith(messageTextElement);
            }
            else {
                inputElement.replaceWith(messageTextElement);
            }
        }
        else {
            inputElement.replaceWith(messageTextElement);
        }

    });
}

function deleteMessage(messageId, tabId) {
    const messageIndex = chatHistory[tabId].findIndex(message => message.id === messageId);
    if (messageIndex > -1) {
        chatHistory[tabId].splice(messageIndex, 1);
        saveChatHistory();
        const messageDiv = document.querySelector(`.chat-messages[data-tab="${tabId}"] .message .message-actions .delete-button[onclick="deleteMessage('${messageId}', '${tabId}')"]`).closest('.message');
        messageDiv.remove();
    }
}

async function translateText(text, sourceLang, targetLang) {
    try {
        const response = await fetch('https://translation.googleapis.com/language/translate/v2', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': apiKey,
            },
            body: JSON.stringify({
                q: text,
                source: sourceLang,
                target: targetLang
            }),
        });
        if (!response.ok) {
            throw new Error('Error al traducir el texto: ' + response.status);
        }
        const data = await response.json();
        return data.data.translations[0].translatedText;
    } catch (error) {
        console.error("Error al traducir:", error);
        return text;
    }
}

function copyToClipboard(button) {
    const messageText = button.parentElement.innerText;
    navigator.clipboard.writeText(messageText)
        .then(() => {
            console.log('Texto copiado al portapapeles');
        })
        .catch(err => {
            console.error('Error al copiar texto: ', err);
        });
}

async function sendMessage() {
    const messageText = userInput.value.trim();
    if (!messageText) return;
    const userMessage = new ChatMessage(messageText, true, languageSelector.value);
    addMessageToChat(userMessage, currentTab);
    chatHistory[currentTab].push(userMessage);
    saveChatHistory();
    userInput.value = '';
    showLoadingIndicator(true, currentTab);
    try {
        const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': apiKey
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: messageText }]
                }]
            }),
        });
        if (!response.ok) {
            const error = await response.json();
            const errorMensaje = new ChatMessage(`Error al obtener respuesta: ${error.error.message}`, false);
            addMessageToChat(errorMensaje, currentTab);
            chatHistory[currentTab].push(errorMensaje);
            saveChatHistory();
            showLoadingIndicator(false, currentTab);
            console.error("Error al consumir el API", response.status, error.error.message);
            return;
        }
        const data = await response.json();
        const geminiResponseText = data.candidates[0].content.parts[0].text;
        const geminiMessage = new ChatMessage(geminiResponseText, false, 'en');
        addMessageToChat(geminiMessage, currentTab);
        chatHistory[currentTab].push(geminiMessage);
        saveChatHistory();
        showLoadingIndicator(false, currentTab);
    } catch (error) {
        const errorMensaje = new ChatMessage("Error inesperado. Inténtalo de nuevo más tarde.", false);
        addMessageToChat(errorMensaje, currentTab);
        chatHistory[currentTab].push(errorMensaje);
        saveChatHistory();
        showLoadingIndicator(false, currentTab);
        console.error("Error inesperado:", error);
    }
}

function clearChat() {
    const chatMessages = currentTab === 'chat1' ? chatMessagesDiv : chatMessagesDiv2;
    chatMessages.innerHTML = '';
    chatHistory[currentTab] = [];
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));

}

function saveChat() {
    const chatData = JSON.stringify(chatHistory);
    const blob = new Blob([chatData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chat_history.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function loadChat(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const loadedHistory = JSON.parse(e.target.result);
            if (typeof loadedHistory === 'object' && loadedHistory !== null) {
                chatHistory = loadedHistory;
                  chatMessagesDiv.innerHTML = '';
                 chatMessagesDiv2.innerHTML = '';
                 for (const tab in chatHistory) {
                     chatHistory[tab].forEach(message => addMessageToChat(message, tab));
                 }
                saveChatHistory();
            } else {
                alert("Formato del archivo no es valido")
            }
        } catch (error) {
            alert("Error al cargar el chat:" + error.message);
        }
    };
    reader.readAsText(file);
    loadChatInput.value = '';
}

function searchChat(searchTerm) {
   const chatMessages = currentTab === 'chat1' ? chatMessagesDiv : chatMessagesDiv2;
    