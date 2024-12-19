const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const apiKeyInput = document.getElementById('api-key-input');
const modelSelect = document.getElementById('model-select');
const maxTokensInput = document.getElementById('max-tokens-input');
const temperatureInput = document.getElementById('temperature-input');
const topPInput = document.getElementById('top-p-input');
const settingsModal = document.getElementById('settings-modal');
const saveSettingsButton = document.getElementById('save-settings-button');
const settingsButton = document.getElementById('settings-button');
const closeModalButton = document.getElementById('close-modal-button');
const loadingOverlay = document.getElementById('loading-overlay');
const clearChatButton = document.getElementById('clear-chat-button');
const copyChatButton = document.getElementById('copy-chat-button');
const errorModal = document.getElementById('error-modal');
const closeErrorButton = document.getElementById('close-error-button');
const errorMessageText = document.getElementById('error-message-text');
const maxTokensError = document.getElementById('max-tokens-error');
const temperatureError = document.getElementById('temperature-error');
const topPError = document.getElementById('top-p-error');
// Clave de API predefinida
let savedApiKey = "TU_CLAVE_API_AQUI";  // <-- Reemplaza esto con tu clave API de Gemini
let savedModel = 'gemini-pro';
let savedMaxTokens = 200;
let savedTemperature = 0.5;
let savedTopP = 0.9;


sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
    adjustTextareaHeight();
});

settingsButton.addEventListener('click', () => {
    settingsModal.style.display = 'block';
});

closeModalButton.addEventListener('click', () => {
    settingsModal.style.display = 'none';
});

saveSettingsButton.addEventListener('click', saveSettings);

window.addEventListener('click', (event) => {
    if (event.target === settingsModal) {
        settingsModal.style.display = 'none';
    }
    if (event.target === errorModal) {
        errorModal.style.display = 'none';
    }

});

closeErrorButton.addEventListener('click', () => {
    errorModal.style.display = 'none';
});

clearChatButton.addEventListener('click', clearChat);

copyChatButton.addEventListener('click', copyChat);

function adjustTextareaHeight() {
    userInput.style.height = 'auto';
    userInput.style.height = (userInput.scrollHeight) + 'px';
}

function sendMessage() {
    const message = userInput.value.trim();
    if (message) {
        addUserMessage(message);
        userInput.value = '';
        adjustTextareaHeight();
        sendToGemini(message);

    }
}

function addUserMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', 'user-message');
    messageElement.innerHTML = `<p>${message}</p>`;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
// Función para mostrar el mensaje de error y mostrar el modal de error
function showError(message) {
    errorMessageText.textContent = message;
    errorModal.style.display = 'block';
}

async function sendToGemini(message) {
    showLoading();
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + savedModel + ':generateContent?key=' + savedApiKey;
    const data = {
        contents: [{
            parts: [{
                text: message,
            },],
        },],
        generationConfig: {
            maxOutputTokens: savedMaxTokens,
            temperature: savedTemperature,
            topP: savedTopP,
        },
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`Error de la API Gemini: ${response.status} - ${response.statusText}`);
        }
        const responseData = await response.json();
        if (responseData.candidates && responseData.candidates.length > 0) {
            const geminiResponse = responseData.candidates[0].content.parts[0].text;
            addGeminiMessage(geminiResponse);

        } else {
            throw new Error('La respuesta de Gemini esta vacía.');
        }

    } catch (error) {
        console.error("Error:", error);
        showError("Error al comunicarse con Gemini. Por favor verifica tu clave API y configuración. Detalle: " + error.message);

    } finally {
        hideLoading();
    }
}

function addGeminiMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', 'gemini-message');
    messageElement.innerHTML = `<p>${message}</p>`;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function saveSettings() {
    const maxTokens = Number(maxTokensInput.value);
    const temperature = Number(temperatureInput.value);
    const topP = Number(topPInput.value);

    //Validar max tokens
    if (isNaN(maxTokens) || maxTokens < 10 || maxTokens > 2048) {
        maxTokensError.textContent = 'El valor de Max tokens debe ser un número entre 10 y 2048.';
        return;

    } else {
        maxTokensError.textContent = '';
    }
    // Validar temperatura
    if (isNaN(temperature) || temperature < 0 || temperature > 1) {
        temperatureError.textContent = 'La temperatura debe ser un número entre 0 y 1.';
        return;
    } else {
        temperatureError.textContent = '';
    }

    // Validar top_p
    if (isNaN(topP) || topP < 0 || topP > 1) {
        topPError.textContent = 'Top P debe ser un número entre 0 y 1.';
        return;
    } else {
        topPError.textContent = '';
    }

    savedModel = modelSelect.value;
    savedMaxTokens = maxTokens;
    savedTemperature = temperature;
    savedTopP = topP;

    localStorage.setItem('geminiSettings', JSON.stringify({
        model: savedModel,
        maxTokens: savedMaxTokens,
        temperature: savedTemperature,
        topP: savedTopP,
    }));

    settingsModal.style.display = 'none';
}

function showLoading() {
    loadingOverlay.style.display = 'flex';
}

function hideLoading() {
    loadingOverlay.style.display = 'none';
}

function clearChat() {
    chatMessages.innerHTML = '<div class="message system-message"><p>Bienvenido al Chat Gemini Presidencial. Pregunta lo que necesites.</p></div>';
}

function copyChat() {
    const chatText = Array.from(chatMessages.children)
        .map(message => {
            const messageText = message.querySelector('p').textContent;
            const messageType = message.classList.contains('user-message') ? 'Usuario:' : message.classList.contains('gemini-message') ? 'Gemini:' : 'System:';
            return messageType + ' ' + messageText;
        }).join('\n');
    navigator.clipboard.writeText(chatText)
        .then(() => alert('Chat copiado al portapapeles.'))
        .catch(err => {
            console.error('Error al copiar el chat: ', err);
            alert('Error al copiar el chat. Inténtalo de nuevo.')
        });
}