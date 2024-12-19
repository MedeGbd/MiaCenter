const apiKey = "kPVaJ4AmXOxsd8AkDSjtFyeSstecoVVWXMmsB8oONkechiB4Bgs81CDVP"; //RECUERDA GUARDARLA EN UN .ENV
const chatMessages = document.getElementById("chat-messages");
const userInput = document.getElementById("user-input");
const creatorAvatar = document.getElementById('creator-avatar');
const creatorName = document.getElementById('creator-name');
const creatorEmail = document.getElementById('creator-email');


const creatorData = {
  "creator": "darlingg",
  "status": true,
  "data": {
    "name": "Delirius Modules",
    "avatar": "https://www.npmjs.com/npm-avatar/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdmF0YXJVUkwiOiJodHRwczovL3MuZ3JhdmF0YXIuY29tL2F2YXRhci9iMDEwMGIzZmYyMjUxN2MxODA3MGMwNDJiZjA5NmU5MD9zaXplPTQ5NiZkZWZhdWx0PXJldHJvIn0.DgiMD02ijmS1SlHG1EQ31HUnHbVDYW42TD0xKg_kogw",
    "email": "deliriusbest8@gmail.com",
  }
};
  creatorAvatar.src = creatorData.data.avatar;
  creatorName.textContent = creatorData.data.name;
  creatorEmail.textContent = creatorData.data.email;


async function sendMessage() {
    const message = userInput.value.trim();
    if (message) {
        appendMessage("user", message);
        userInput.value = "";
        // Enviar a la api de Gemini (función simulada por ahora)
        const geminiResponse = await getGeminiResponse(message);
        appendMessage("gemini", geminiResponse);
    }
}

function appendMessage(sender, message) {
    const messageElement = document.createElement("div");
    messageElement.textContent = message;

    if(sender === "user"){
        messageElement.classList.add('user-message');
    } else if(sender === "gemini"){
        messageElement.classList.add("gemini-message");
    }


    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight; // Auto scroll to bottom
}

// Simulación de llamada a la API de Gemini (reemplazar con la función real)
async function getGeminiResponse(message) {
    // Aquí iría el código para llamar a la API de Gemini.
    // Por ahora, simulo una respuesta.
    console.log(`Enviando mensaje a Gemini API: ${message}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return  `Respuesta simulada de Gemini para: ${message}`;
}