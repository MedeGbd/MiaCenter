const WebSocket = require('ws');
const http = require('http');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

const connectedUsers = new Set();

wss.on('connection', ws => {
    const userId = generateAnonymousId();
    connectedUsers.add(userId);
    console.log(`Usuario conectado: ${userId}`);

    // Enviar la lista de usuarios al nuevo usuario
    ws.send(JSON.stringify({ type: 'userList', users: Array.from(connectedUsers) }));

    // Enviar la lista de usuarios a todos los usuarios
    broadcast({ type: 'userList', users: Array.from(connectedUsers) }, userId);

    ws.on('message', message => {
        try {
            const parsedMessage = JSON.parse(message);
            if (parsedMessage.type === 'chat') {
                broadcast({ type: 'chat', message: parsedMessage.message, sender: userId }, userId);
            } else if (parsedMessage.type === 'gemini') {
                broadcast({ type: 'gemini', message: parsedMessage.message, sender: userId }, userId);
            }
        } catch (error) {
            console.error('Error al procesar el mensaje:', error);
        }
    });

    ws.on('close', () => {
        connectedUsers.delete(userId);
        console.log(`Usuario desconectado: ${userId}`);
        broadcast({ type: 'userList', users: Array.from(connectedUsers) }, userId);
    });

    ws.on('error', error => {
        console.error('Error en la conexión WebSocket:', error);
    });
});

function broadcast(data, senderId) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

function generateAnonymousId() {
    return Math.random().toString(36).substring(2, 15);
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor WebSocket escuchando en el puerto ${PORT}`);
});