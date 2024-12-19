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

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error del servidor:', errorData);
             appendMessage("gemini", `Error al procesar tu mensaje`);
            return
        }

      const data = await response.json();
      console.log('Respuesta del servidor:', data);
      appendMessage("gemini", data.reply);
    } catch (error) {
      console.error('Error al enviar la solicitud:', error);
    appendMessage("gemini", `Error al procesar tu mensaje`);

    }
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
  chatMessages.scrollTop = chatMessages.scrollHeight;
}