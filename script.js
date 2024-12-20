document.getElementById('send-btn').addEventListener('click', function () {
    var message = document.getElementById('user-message').value;

    // Verificar que el mensaje no esté vacío
    if (message.trim() === "") {
        displayStatusMessage("Por favor, escribe un mensaje.", "error");
        return;
    }

    // Mostrar el mensaje del usuario en el chat
    addMessageToChat('Tú: ' + message);

    // Limpiar el campo de texto
    document.getElementById('user-message').value = '';

    // Mostrar mensaje de "Esperando respuesta..." mientras se hace la solicitud
    displayStatusMessage("Esperando respuesta...", "info");

    // Llamada a la API
    fetch('https://api.example.com/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            userMessage: message,
            apiKey: 'AIzaSyCROBmKaRKNo7rhxJIOTSiXVGLb5YVmXD4'
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error en la respuesta de la API');
        }
        return response.json();
    })
    .then(data => {
        // Suponemos que la respuesta contiene un campo 'response' con el mensaje de la API
        addMessageToChat('API: ' + data.response);
        displayStatusMessage("Mensaje enviado correctamente.", "success");
    })
    .catch(error => {
        console.error('Error al conectar con la API:', error);
        addMessageToChat('API: No se pudo obtener respuesta.');
        displayStatusMessage("Hubo un problema al contactar con el servidor.", "error");
    });
});

// Función para agregar mensajes al chat
function addMessageToChat(message) {
    var chatBox = document.getElementById('chat-box');
    var messageElement = document.createElement('div');
    messageElement.textContent = message;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight; // Desplazar hacia abajo el chat
}

// Función para mostrar mensajes de estado (error, éxito, etc.)
function displayStatusMessage(message, type) {
    var statusElement = document.getElementById('status-message');
    statusElement.textContent = message;
    
    // Limpiar clases previas
    statusElement.classList.remove('error', 'success', 'info');
    
    // Añadir la clase según el tipo de mensaje
    statusElement.classList.add(type);

    // Mostrar el mensaje
    statusElement.style.display = 'block';
}
