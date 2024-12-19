const API_KEY = "AIzaSyCO3FjWv0dweKSrA63aAluOLElhpoCCQdQ"; // Reemplaza con tu API Key de Gemini
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const chatHistory = document.getElementById('chat-history');
const userCountDisplay = document.getElementById('user-count');

let connectedUsers = new Set();
let userId = generateAnonymousId();


function getStoredUsers() {
    const storedUsers = localStorage.getItem('connectedUsers');
    return storedUsers ? new Set(JSON.parse(storedUsers)) : new Set();
}

function storeUsers(users) {
    localStorage.setItem('connectedUsers', JSON.stringify(Array.from(users)));
}

function updateUserList(){
    connectedUsers = getStoredUsers();
    connectedUsers.add(userId);
    storeUsers(connectedUsers);
    updateUserCountDisplay();
}

updateUserList();
window.addEventListener('beforeunload', () => {
    connectedUsers.delete(userId);
    storeUsers(connectedUsers);
});

sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

// Función para enviar el mensaje
async function sendMessage() {
    const message = userInput.value.trim();
    if (message === "") return;
    
     // Determinar si el mensaje es para Gemini o usuarios
     if (message.startsWith("/")) {
        processGeminiMessage(message.substring(1));
     }
    else{
        broadcastMessage(message, userId); // Enviar el mensaje a todos
    }

    userInput.value = "";
}

//Procesar Mensaje a Geminis
async function processGeminiMessage(message){
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
            broadcastMessage(geminiResponse, "Gemini", "gemini");
        } else {
            broadcastMessage("No se pudo obtener una respuesta válida", "Gemini", "gemini");
        }
    } catch (error) {
        console.error('Error al obtener respuesta de Gemini:', error);
        broadcastMessage("Error al obtener la respuesta del servidor.", "Gemini", "gemini");
    }
}


// Función para enviar el mensaje a todos
function broadcastMessage(message, sender, senderId) {
    connectedUsers.forEach(user => {
        // Enviar el mensaje a todos los usuarios conectados (incluyendo al que lo envió).
        addMessage(sender === "Gemini" ? sender : "Usuario " + sender.substring(0, 5) + " dice:", message, senderId)
    });
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

function generateAnonymousId() {
    return Math.random().toString(36).substring(2, 15);
}

function updateUserCountDisplay() {
    userCountDisplay.textContent = connectedUsers.size;
}


if (connectedUsers.size > 0){
    updateUserCountDisplay();
}