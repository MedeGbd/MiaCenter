const API_KEY = "AIzaSyCO3FjWv0dweKSrA63aAluOLElhpoCCQdQ"; // Reemplaza con tu API Key de Gemini
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const chatHistory = document.getElementById('chat-history');
const userCountDisplay = document.getElementById('user-count');
const userNameInput = document.getElementById('user-name-input');
const setNameButton = document.getElementById('set-name-button');
const userList = document.getElementById('user-list');

const socket = new WebSocket('ws://localhost:3000'); // Conecta al servidor WebSocket
let userId;
let userName = 'Usuario';

socket.onopen = () => {
    console.log('Conectado al servidor WebSocket');
};

socket.onmessage = event => {
    try {
        const data = JSON.parse(event.data);
        if (data.type === 'userId') {
            userId = data.userId;
            console.log('User ID:', userId);
        } else if (data.type === 'chat') {
            addMessage(data.userName, data.message, data.isMe ? 'user' : 'gemini');
        } else if (data.type === 'gemini') {
             addMessage('Gemini', data.message, data.isMe ? 'user' : 'gemini' );
        } else if (data.type === 'userList') {
            updateUserList(data.users);
            updateUserCountDisplay(data.users.length);
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

setNameButton.addEventListener('click', setUserName);

async function setUserName() {
    const newUserName = userNameInput.value.trim();
    if (newUserName === "") return;
    userName = newUserName;
    socket.send(JSON.stringify({ type: 'userName', userName: userName }));
    userNameInput.value = "";
}

async function sendMessage() {
    const message = userInput.value.trim();
    if (message === "") return;

    if (message.startsWith("/")) {
        processGeminiMessage(message.substring(1));
    } else {
        socket.send(JSON.stringify({ type: 'chat', message: message, sender: userId, userName: userName }));
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
             socket.send(JSON.stringify({ type: 'gemini', message: geminiResponse, sender: userId, userName: userName }));
        } else {
           socket.send(JSON.stringify({ type: 'gemini', message: "No se pudo obtener una respuesta válida",  sender: userId, userName: userName }));
        }
    } catch (error) {
        console.error('Error al obtener respuesta de Gemini:', error);
         socket.send(JSON.stringify({ type: 'gemini', message: "Error al obtener la respuesta del servidor.", sender: userId, userName: userName }));
    }
}

function addMessage(sender, message, senderClass) {
    const messageElement = document.createElement('p');
    messageElement.classList.add(senderClass);
    messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatHistory.appendChild(messageElement);
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

function updateUserCountDisplay(count) {
    userCountDisplay.textContent = count;
}

function updateUserList(users) {
    userList.innerHTML = '';
    users.forEach(user => {
        const listItem = document.createElement('li');
        listItem.textContent = user.name;
        userList.appendChild(listItem);
    });
}