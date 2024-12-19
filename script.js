const API_KEY = "AIzaSyCO3FjWv0dweKSrA63aAluOLElhpoCCQdQ";  // Reemplaza con tu API Key de Gemini
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const chatHistory = document.getElementById('chat-history');
const userCountDisplay = document.getElementById('user-count');


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

// Función principal para enviar mensajes
async function sendMessage() {
    const message = userInput.value.trim();
    if (message === "") return;

    addMessage("Tú", message, userId); // Agrega el mensaje al chat, mostrando quién lo envió

    // Determina si se debe enviar el mensaje a Gemini o a otros usuarios
    if (message.startsWith("/")) {
         // Si el mensaje empieza con "/" se enviará a Gemini
        processGeminiMessage(message.substring(1));
    } else {
        // Si no, el mensaje se enviará a todos los usuarios
       broadcastUserMessage(message);
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
            addMessage("Gemini", geminiResponse, "gemini");
        } else {
           addMessage("Gemini", "No se pudo obtener una respuesta válida", "gemini");
        }
    } catch (error) {
        console.error('Error al obtener respuesta de Gemini:', error);
         addMessage("Gemini", "Error al obtener la respuesta del servidor.", "gemini");
    }
}

// Enviar mensaje a todos los usuarios
function broadcastUserMessage(message){
    connectedUsers.forEach(user => {
        if (user !== userId){ // No mandarse el mensaje a sí mismo
           addMessage("Usuario "+ user.substring(0, 5) + " dice:", message, "user"); // Muestra el mensaje de otros usuarios
        }
    });
}


// Función para agregar un mensaje al chat
function addMessage(sender, message, senderId) {
    const messageElement = document.createElement('p');
    messageElement.classList.add(senderId); // Agrega una clase para identificar quién envió el mensaje
    messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatHistory.appendChild(messageElement);

    const hr = document.createElement('hr');
    chatHistory.appendChild(hr);

    chatHistory.scrollTop = chatHistory.scrollHeight;
}


// Función para generar un ID anónimo para cada usuario
function generateAnonymousId() {
    return Math.random().toString(36).substring(2, 15);
}

// Función para actualizar la cantidad de usuarios conectados
function updateUserCountDisplay() {
    userCountDisplay.textContent = connectedUsers.size;
}

// Simulacion para agregar otro usuario (simula la llegada de un nuevo usuario)
setInterval(() => {
    let newUserId = generateAnonymousId();
    connectedUsers.add(newUserId);
    updateUserCountDisplay();
    console.log("nuevo usuario conectado: " + newUserId)
}, 20000);

// Simulacion para simular la desconección de un usuario
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
  }, 30000);