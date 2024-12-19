const API_KEY = "AIzaSyCO3FjWv0dweKSrA63aAluOLElhpoCCQdQ";
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const chatHistory = document.getElementById('chat-history');
const loadingIndicator = document.getElementById('loading-indicator');
const languageSelect = document.getElementById('language-select');
const chatTitle = document.getElementById('chat-title');
let translations = {};

// Cargar el idioma seleccionado
async function loadLanguage(languageCode) {
    try {
        const response = await fetch(`${languageCode}.json`);
        if (!response.ok) {
            throw new Error(`Failed to load language file: ${languageCode}.json`);
        }
        translations = await response.json();
        updateUI(); // Actualizar la interfaz con los textos traducidos
    } catch (error) {
        console.error('Error loading language:', error);
        translations = {}; // Resetear a un objecto vacio para no romper la aplicación
        updateUI(); // Actualizar la interfaz con los textos por defecto

    }
}
function getTranslation(key) {
    return translations[key] || key; // Devolver la traducción o la key si no se encuentra
}

function updateUI() {
  chatTitle.textContent = getTranslation('chatTitle');
  userInput.placeholder = getTranslation('inputPlaceholder');
  sendButton.textContent = getTranslation('sendButton');
}

sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

async function sendMessage() {
    const message = userInput.value.trim();
    if (message === "") return;

    addMessage(getTranslation('user'), message, 'user-message');
    userInput.value = "";
    loadingIndicator.style.display = 'block';

    try {
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': API_KEY
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: message }] }]
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const geminiResponse = data.candidates[0]?.content?.parts[0]?.text;


        if (geminiResponse) {
            addMessage(getTranslation('gemini'), geminiResponse, 'gemini-message');
        } else {
           addMessage(getTranslation('gemini'), getTranslation('noResponse'), 'gemini-message');
        }
    } catch (error) {
        console.error('Error al obtener respuesta de Gemini:', error);
        addMessage(getTranslation('gemini'), getTranslation('serverError'), 'gemini-message');
    } finally {
        loadingIndicator.style.display = 'none';
    }

}

function addMessage(sender, message, cssClass) {
    const messageElement = document.createElement('p');
    messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
    messageElement.classList.add(cssClass);
    chatHistory.appendChild(messageElement);

    const hr = document.createElement('hr');
    chatHistory.appendChild(hr);

    chatHistory.scrollTop = chatHistory.scrollHeight;
}
// Cargar el idioma inicial
loadLanguage(languageSelect.value);
languageSelect.addEventListener('change', () => {
    loadLanguage(languageSelect.value);
});