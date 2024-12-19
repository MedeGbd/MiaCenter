const WebSocket = require('ws');
const http = require('http');
const { v4: uuidv4 } = require('uuid');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

const connectedUsers = new Map();
const userNames = new Map();

wss.on('connection', ws => {
    const userId = uuidv4();
    connectedUsers.set(userId, ws);
    userNames.set(userId, `Usuario ${connectedUsers.size}`);

    console.log(`Usuario conectado: ${userId}`);
    ws.send(JSON.stringify({ type: 'userId', userId: userId }));
    broadcastUserList();

    ws.on('message', message => {
        try {
            const parsedMessage = JSON.parse(message);
            if (parsedMessage.type === 'chat') {
                const { message, sender, userName } = parsedMessage;
                broadcast({ type: 'chat', message, sender, userName: userNames.get(sender) }, userId);
            } else if (parsedMessage.type === 'gemini') {
                const { message, sender, userName } = parsedMessage;
                broadcast({ type: 'gemini', message, sender, userName: userNames.get(sender) }, userId);
            } else if (parsedMessage.type === 'userName') {
                userNames.set(userId, parsedMessage.userName);
                broadcastUserList();
            }
        } catch (error) {
            console.error('Error al procesar el mensaje:', error);
        }
    });

    ws.on('close', () => {
        connectedUsers.delete(userId);
        userNames.delete(userId);
        console.log(`Usuario desconectado: ${userId}`);
        broadcastUserList();
    });

    ws.on('error', error => {
        console.error('Error en la conexión WebSocket:', error);
    });
});

function broadcast(data, senderId) {
    connectedUsers.forEach((client, id) => {
         if (client.readyState === WebSocket.OPEN) {
             if (id === senderId) {
               data.isMe = true
            } else {
                 data.isMe = false
            }
            client.send(JSON.stringify(data));
        }
    });
}

function broadcastUserList() {
    const userList = Array.from(userNames.entries()).map(([id, name]) => ({ id, name }));
    broadcast({ type: 'userList', users: userList });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor WebSocket escuchando en el puerto ${PORT}`);
});