const API_KEY = "AIzaSyCO3FjWv0dweKSrA63aAluOLElhpoCCQdQ";
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const chatHistory = document.getElementById('chat-history');
const userCountDisplay = document.getElementById('user-count');


// SIMULACIÓN DE USUARIOS CONECTADOS (No realista)
let connectedUsers = new Set();
let userId = generateAnonymousId();
connectedUsers.add(userId);
updateUserCountDisplay();

sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

async function sendMessage() {
    const message = userInput.value.trim();
    if (message === "") return;

    addMessage("Tú", message);
    userInput.value = "";

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
            addMessage("Gemini", geminiResponse);
        } else {
           addMessage("Gemini", "No se pudo obtener una respuesta válida");
        }
    } catch (error) {
        console.error('Error al obtener respuesta de Gemini:', error);
         addMessage("Gemini", "Error al obtener la respuesta del servidor.");
    }
}

function addMessage(sender, message) {
    const messageElement = document.createElement('p');
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

// Simulacion para agregar otro usuario (simula la llegada de un nuevo usuario)

setInterval(() => {
    let newUserId = generateAnonymousId();
    connectedUsers.add(newUserId);
    updateUserCountDisplay();
    console.log("nuevo usuario conectado: " + newUserId)

}, 20000); //Simula un usuario nuevo cada 20 segundos

setInterval(() => {
    if (connectedUsers.size > 0) {
        let userToRemove = null;
        connectedUsers.forEach(user => {
          userToRemove = user
            return;
        })
        connectedUsers.delete(userToRemove);
        updateUserCountDisplay();
        console.log("usuario desconectado: " + userToRemove);
    }


  }, 30000);  //Simula que un usuario se va cada 30 segundos