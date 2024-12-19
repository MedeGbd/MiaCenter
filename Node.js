const WebSocket = require('ws');
const http = require('http');
const { v4: uuidv4 } = require('uuid');
const server = http.createServer();
const wss = new WebSocket.Server({ server });
const connectedUsers = new Map(); // Almacena usuarios conectados
const userNames = new Map(); // Almacena los nombres de usuario

function broadcast(data, senderId) {
    connectedUsers.forEach((client, id) => {
        if (client.readyState === WebSocket.OPEN) {
            if (id === senderId) {
                data.isMe = true
            } else {
                data.isMe = false
            }
            client.send(JSON.stringify(data)); // Enviar datos a los clientes conectados
        }
    });
}
function broadcastUserList() {
    const userList = Array.from(userNames.entries()).map(([id, name]) => ({
        id,
        name
    }));
    broadcast({
        type: 'userList',
        users: userList
    });
}
wss.on('connection', ws => {
    const userId = uuidv4(); // Generar un ID único para cada usuario
    connectedUsers.set(userId, ws); // Añadir el usuario a la lista de usuarios conectados
    userNames.set(userId, `Usuario ${connectedUsers.size}`); // Asignar nombre por defecto al usuario
    console.log(`Usuario conectado: ${userId}`);
    ws.send(JSON.stringify({
        type: 'userId',
        userId: userId
    })); // Enviar ID de usuario al cliente
    broadcastUserList(); // Actualizar la lista de usuarios
    ws.on('message', message => {
        try {
            const parsedMessage = JSON.parse(message); // Parsear mensaje
            if (parsedMessage.type === 'chat') {
                const {
                    message,
                    sender,
                    userName
                } = parsedMessage;
                broadcast({
                    type: 'chat',
                    message,
                    sender,
                    userName: userNames.get(sender)
                }, userId); // Enviar mensaje a todos los usuarios
            } else if (parsedMessage.type === 'gemini') {
                const {
                    message,
                    sender,
                    userName
                } = parsedMessage;
                broadcast({
                    type: 'gemini',
                    message,
                    sender,
                    userName: userNames.get(sender)
                }, userId);
            } else if (parsedMessage.type === 'userName') {
                userNames.set(userId, parsedMessage.userName); // Actualizar