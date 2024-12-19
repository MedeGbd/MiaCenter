const API_KEY = "AIzaSyCO3FjWv0dweKSrA63aAluOLElhpoCCQdQ"; // <-- ¡CLAVE API INCLUIDA DIRECTAMENTE!
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const chatHistory = document.getElementById('chat-history');


sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

async function sendMessage() {
    const message = userInput.value.trim();
    if (message === "") return;

    // Mostrar la pregunta del usuario
    addMessage("Tú", message);
    userInput.value = "";


    try {
        // Realizar la llamada a la API de Gemini
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
            // Mostrar la respuesta de Gemini
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

    // Agregar línea divisora después de cada mensaje
    const hr = document.createElement('hr');
    chatHistory.appendChild(hr);


    chatHistory.scrollTop = chatHistory.scrollHeight; // Scroll al final del chat
}