class ChatMessage {
    constructor(text, isUser, language = 'es', isPinterest = false, data = null) {
        this.text = text;
        this.isUser = isUser;
        this.language = language;
        this.isPinterest = isPinterest;
        this.data = data;
    }
}

const chatMessagesDiv = document.getElementById('chat-messages');
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
const loadingIndicator = document.getElementById('loading-indicator');

let chatHistory = [];
let isVoiceRecognitionActive = false;
let recognition;
let translations = {};
let currentLanguage = localStorage.getItem('chatLanguage') || 'es';

const geminiMessageColors = [
    '#34495e', '#27ae60', '#f39c12', '#9b59b6', '#e74c3c',
    '#1abc9c', '#3498db', '#f1c40f', '#d35400', '#c0392b'
];
let colorIndex = 0;
let previousGeminiColor = null;


function showLoadingIndicator(show) {
    loadingIndicator.style.display = show ? 'block' : 'none';
}

function loadChatHistory() {
    const storedHistory = localStorage.getItem('chatHistory');
    if (storedHistory) {
        chatHistory = JSON.parse(storedHistory);
        chatHistory.forEach(message => addMessageToChat(message));
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

function addMessageToChat(message) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');

    if (message.isUser) {
        messageDiv.classList.add('user-message');
        messageDiv.classList.add('user-message-color');
        messageDiv.innerHTML = message.text;
    } else if (message.isPinterest) {
        messageDiv.classList.add('pinterest-message');
        if (document.body.classList.contains('light-theme')) {
            messageDiv.classList.add('light-theme');
        }
        if (message.data) {
            let pinterestHtml = '';
            if (message.data.image) {
                pinterestHtml += `<img src="${message.data.image}" alt="Pinterest Image" class="pinterest-image">`;
            }
            if (message.data.title) {
                pinterestHtml += `<h3 class="pinterest-title">${message.data.title}</h3>`;
            }
            if (message.data.link) {
                pinterestHtml += `<a href="${message.data.link}" class="pinterest-link" target="_blank" rel="noopener noreferrer">Ver en Pinterest</a>`;
            }
            messageDiv.innerHTML = `${pinterestHtml}   <button class="copy-button" onclick="copyToClipboard(this)"><i class="fas fa-copy"></i></button>`;
        } else {
            messageDiv.innerHTML = `${message.text}   <button class="copy-button" onclick="copyToClipboard(this)"><i class="fas fa-copy"></i></button>`;
        }
    } else {
        messageDiv.classList.add('gemini-message');
        let geminiColor = getNextGeminiColor();
        messageDiv.style.backgroundColor = geminiColor;
        let translatedText = message.text;
        if (translationSelector.value === 'enabled' && message.language !== languageSelector.value) {
            translateText(message.text, message.language, languageSelector.value).then(translation => {
                translatedText = translation;
                messageDiv.innerHTML = `${translatedText}  <button class="copy-button" onclick="copyToClipboard(this)"><i class="fas fa-copy"></i></button>`;
            });
        } else {
            messageDiv.innerHTML = `${translatedText}  <button class="copy-button" onclick="copyToClipboard(this)"><i class="fas fa-copy"></i></button>`;
        }
    }
    chatMessagesDiv.appendChild(messageDiv);
    chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
}


async function translateText(text, sourceLang, targetLang) {
    try {
        const response = await fetch('https://translation.googleapis.com/language/translate/v2', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': 'YOUR_TRANSLATION_API_KEY',
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

function getNextGeminiColor() {
    const color = geminiMessageColors[colorIndex % geminiMessageColors.length];

    if (color === previousGeminiColor) {
        colorIndex = (colorIndex + 1) % geminiMessageColors.length;
        return geminiMessageColors[colorIndex % geminiMessageColors.length]
    } else {
        previousGeminiColor = color;
        colorIndex++;
        return color;
    }
}
async function sendMessage() {
    const messageText = userInput.value.trim();
    if (!messageText) return;

    const userMessage = new ChatMessage(messageText, true, languageSelector.value);
    addMessageToChat(userMessage);
    chatHistory.push(userMessage);
    saveChatHistory();
    userInput.value = '';
    showLoadingIndicator(true);

    const pinterestURLRegex = /^(https?:\/\/(?:www\.)?pinterest\.com\/(?:pin|board|user)\/[\w\d\-_%?=&]*)/i;
    const pinterestMatch = messageText.match(pinterestURLRegex);

    if (pinterestMatch) {
         try {
            const apiUrl = `/api/pinterest?url=${encodeURIComponent(pinterestMatch[0])}`;
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error('Error al consumir la API de Pinterest');
            }
            const data = await response.json();
            let apiResponseMessage;
            if (data.status === false) {
                apiResponseMessage = new ChatMessage(`${data.message}`, false);
            } else {
                const pinterestData = {
                    image: data.image || null,
                    title: data.title || null,
                    link: data.link || null,
                };
                apiResponseMessage = new ChatMessage("Respuesta de Pinterest", false, null, true, pinterestData);
            }
            addMessageToChat(apiResponseMessage);
            chatHistory.push(apiResponseMessage);
            saveChatHistory();
            showLoadingIndicator(false);
        } catch (error) {
            const errorMensaje = new ChatMessage("Error al procesar la URL de Pinterest: " + error.message, false);
            addMessageToChat(errorMensaje);
            chatHistory.push(errorMensaje);
            saveChatHistory();
            showLoadingIndicator(false);
            console.error("Error inesperado:", error);
        }
    } else {
    try {
          const response = await fetch('/api/chat', {
              method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: messageText, language: languageSelector.value }),
        });
           if (!response.ok) {
                  const error = await response.json();
                  const errorMensaje = new ChatMessage(`Error al obtener respuesta: ${error.message}`, false);
                   addMessageToChat(errorMensaje);
                  chatHistory.push(errorMensaje);
                    saveChatHistory();
                    showLoadingIndicator(false);
                     console.error("Error al consumir el API", response.status, error.message);
                     return;
              }
            const data = await response.json();
            const geminiMessage = new ChatMessage(data.geminiResponse, false, data.geminiLanguage);
              addMessageToChat(geminiMessage);
            chatHistory.push(geminiMessage);
            saveChatHistory();
           showLoadingIndicator(false);
        } catch (error) {
            const errorMensaje = new ChatMessage("Error inesperado. Inténtalo de nuevo más tarde.", false);
            addMessageToChat(errorMensaje);
            chatHistory.push(errorMensaje);
            saveChatHistory();
            showLoadingIndicator(false);
            console.error("Error inesperado:", error);
        }
    }
}

function clearChat() {
    chatMessagesDiv.innerHTML = '';
    chatHistory = [];
    localStorage.removeItem('chatHistory');
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
            if (Array.isArray(loadedHistory)) {
                chatHistory = loadedHistory;
                chatMessagesDiv.innerHTML = '';
                chatHistory.forEach(message => addMessageToChat(message));
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
    const messages = chatMessagesDiv.querySelectorAll('.message, .pinterest-message');
    messages.forEach(message => {
        const messageText = message.textContent;
        const regex = new RegExp(searchTerm, 'gi');
        const highlightedText = messageText.replace(regex, '<span class="highlight">$&</span>');
        message.innerHTML = highlightedText;
    });
}

function toggleSettingsModal() {
    settingsModal.style.display = settingsModal.style.display === 'none' ? 'block' : 'none';
}

function applyTheme(theme) {
    document.body.classList.remove('light-theme');
    if (theme === 'light') {
        document.body.classList.add('light-theme');
    }
    localStorage.setItem('chatTheme', theme);
}

function applyFont(font) {
    document.body.style.fontFamily = font;
    localStorage.setItem('chatFont', font);
}

async function loadTranslations(lang) {
    try {
        const response = await fetch(`${lang}.json`);
        if (!response.ok) {
            throw new Error(`No se pudo cargar el archivo de idioma ${lang}.json`);
        }
        translations = await response.json();
        applyTranslations();
    } catch (error) {
        console.error("Error al cargar traducciones:", error);
    }
}

function loadSettings() {
    const storedTheme = localStorage.getItem('chatTheme');
    if (storedTheme) {
        applyTheme(storedTheme);
        themeSelector.value = storedTheme;
    }
    const storedFont = localStorage.getItem('chatFont');
    if (storedFont) {
        applyFont(storedFont);
        fontSelector.value = storedFont;
    }
    const storedTranslation = localStorage.getItem('chatTranslation');
    if (storedTranslation) {
        translationSelector