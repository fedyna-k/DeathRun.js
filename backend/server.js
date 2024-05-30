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
let trapperId = null;

const button = {
    id: 1,
    x: 450,
    y: 480,
    width: 50,
    height: 20,
    active: false
};


io.on('connection', (socket) => {
    console.log('a user connected');

    if (trapperId === null) {
        console.log("trapper is : ", socket.id);
        trapperId = socket.id; // Le premier joueur devient le piégeur
    }

    const yPosition = trapperId === socket.id ? 500 : 300;

    const localPlayerId = socket.id;
    const randomColor = colors[Math.floor(Math.random() * colors.length)]
    characters[socket.id] = {
        id: socket.id,
        x: 200,
        y: yPosition,
        color: randomColor,
        role: trapperId === socket.id ? 'trapper' : 'trapped'
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

    socket.on('activate button', (data) => {
        console.log("bouton ", data.buttonId, "activé");
        if(socket.id === trapperId){
            button.active = true;
            io.emit('button activated', {buttonId: button.id, active : button.active});
        }
    })

    socket.on('disconnect', () => {
        console.log('user disconnected');
        delete characters[socket.id];
        if (trapperId === socket.id) {
            const remainingIds = Object.keys(characters);
            trapperId = remainingIds[0] || null; // Nouveau piégeur ou null si plus de joueurs
            if (trapperId) {
                characters[trapperId].y = 500; // Mettre le nouveau piégeur en position
                characters[trapperId].role = 'trapper';
                io.emit('update character', characters[trapperId]);
            }
        }
        io.emit('remove character', socket.id);
    });
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});
