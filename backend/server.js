const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
const path = require ('path');

const characters = {};

app.use(express.static(path.join(__dirname, '../frontend')));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const colors = ['red', 'blue', 'green', 'orange', 'purple', 'yellow'];
let imposterId = null;


io.on('connection', (socket) => {
    console.log('a user connected');

    if (imposterId === null) {
        imposterId = socket.id; // Le premier joueur devient l'imposteur
    }

    const localPlayerId = socket.id;
    const randomColor = colors[Math.floor(Math.random() * colors.length)]
    characters[socket.id] = {
        id: socket.id,
        x: 200,
        y: 300,
        color: randomColor,
        role: imposterId === socket.id ? 'imposter' : 'lambda'
    };

    io.emit('new character', characters[socket.id]);
    socket.emit('init characters', Object.values(characters));


    socket.on('move character', (movement) => {
        if (characters[socket.id] && socket.id === localPlayerId) {
            characters[socket.id].x += movement.x;
            characters[socket.id].y = movement.y;
            io.emit('update character', characters[socket.id]);
            characters[socket.id].y = 0;
        }
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
        delete characters[socket.id];
        if (imposterId === socket.id) {
            const remainingIds = Object.keys(characters);
            imposterId = remainingIds[0] || null; // Nouveau imposteur ou null si plus de joueurs
            if (imposterId) {
                characters[imposterId].role = 'imposter';
                io.emit('update character', characters[imposterId]);
            }
        }
        io.emit('remove character', socket.id);
    });
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});
