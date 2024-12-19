const API_KEY = "AIzaSyCO3FjWv0dweKSrA63aAluOLElhpoCCQdQ"; // Reemplaza con tu API Key de Gemini
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const chatHistory = document.getElementById('chat-history');
const userCountDisplay = document.getElementById('user-count');

const socket = new WebSocket('ws://localhost:3000'); // Conecta al servidor WebSocket

let userId;

socket.onopen = () => {
    console.log('Conectado al servidor WebSocket');
};

socket.onmessage = event => {
    try {
        const data = JSON.parse(event.data);
        if (data.type === 'chat') {
            addMessage("Usuario " + data.sender.substring(0, 5) + " dice:", data.message, "user");
        } else if (data.type === 'gemini') {
            addMessage("Gemini", data.message, "gemini");
        } else if (data.type === 'userList') {
            updateUserCountDisplay(data.users.length);
            if (!userId) {
                userId = data.users.find(user => user !== userId);
            }
        }
    } catch (error) {
        console.error('Error al procesar el mensaje del servidor:', error);
    }
};

socket.onerror = error => {
    console.error('Error en la conexión WebSocket:', error);
};

socket.onclose = () => {
    console.log('Desconectado del servidor WebSocket');
};

sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

async function sendMessage() {
    const message = userInput.value.trim();
    if (message === "") return;

    if (message.startsWith("/")) {
        processGeminiMessage(message.substring(1));
    } else {
        socket.send(JSON.stringify({ type: 'chat', message: message }));
    }
    userInput.value = "";
}

async function processGeminiMessage(message) {
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
            socket.send(JSON.stringify({ type: 'gemini', message: geminiResponse }));
        } else {
            socket.send(JSON.stringify({ type: 'gemini', message: "No se pudo obtener una respuesta válida" }));
        }
    } catch (error) {
        console.error('Error al obtener respuesta de Gemini:', error);
        socket.send(JSON.stringify({ type: 'gemini', message: "Error al obtener la respuesta del servidor." }));
    }
}

function addMessage(sender, message, senderId) {
    const messageElement = document.createElement('p');
    messageElement.classList.add(senderId);
    messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatHistory.appendChild(messageElement);

    const hr = document.createElement('hr');
    chatHistory.appendChild(hr);

    chatHistory.scrollTop = chatHistory.scrollHeight;
}

function updateUserCountDisplay(count) {
    userCountDisplay.textContent = count;
}