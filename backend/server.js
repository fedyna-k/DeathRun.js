const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
const path = require ('path');

const characters = {};
let map = null;
app.use(express.static(path.join(__dirname, '../frontend')));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const colors = ['red', 'blue', 'green', 'orange', 'purple', 'yellow'];
let imposterId = null;


io.on('connection', (socket) => {
    console.log('a user connected');
    if(map === null){
        io.emit('init map', 'pasnull');
    }
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

    socket.on('move character', (data) => {
        // Vérifier s'il y a au moins 2 joueurs connectés
        if (Object.keys(characters).length < 2) {
            io.emit('update character', characters[socket.id]);
            return;
        }
        
        if (characters[socket.id] && socket.id === localPlayerId) {
            characters[socket.id].x += data.x;
            Object.values(characters).forEach(otherChar => {
                if (otherChar.id !== data.id && checkCollision(characters[data.id], otherChar)) {
                    resolveCollision(characters[data.id], otherChar);
                }
            });
            characters[socket.id].y = data.y;
            
            io.emit('update character', characters[socket.id]);
            characters[socket.id].y = 0;
        }
    });

    socket.on('grab character', (id) => {
        // il faut check si un autre joueur est pas loin
        // si oui, position de l'autre joueur = position du joueur courant + 20y
        // sinon on fait rien
    })

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
        if (Object.keys(characters).length === 0) {
            map = null; // Réinitialise la map à null si aucun joueur n'est connecté
            console.log("Map has been reset as there are no more players.");
        }
        io.emit('remove character', socket.id);
    });
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});


function resolveCollision(character1, character2) {
    let coords1 = {x: character1.x, y: character1.y};
    let coords2 = {x: character2.x, y: character2.y};

    // let overlapX = (coords1.x < coords2.x) ? (coords1.x + 20 - coords2.x) : (coords2.x + 20 - coords1.x);
    // let overlapY = (coords1.y < coords2.y) ? (coords1.y + 50 - coords2.y) : (coords2.y + 50 - coords1.y);

    // // Simple repoussement : les personnages sont légèrement décalés à l'opposé l'un de l'autre
    // if (coords1.x < coords2.x) {
    //     character1.x = coords1.x - overlapX / 2;
    //     character2.x = coords2.x + overlapX / 2;
    // } else {
    //     character1.x = coords1.x + overlapX / 2;
    //     character2.x = coords2.x - overlapX / 2;
    // }
    character1.x +=20;
}

function checkCollision(character1, character2) {

    let bounds1 = {xMin: character1.x, xMax: character1.x + 20, yMin: character1.y, yMax: character1.y + 50};
    let bounds2 = {xMin: character2.x, xMax: character2.x + 20, yMin: character2.y, yMax: character2.y + 50};

    // Vérifie si les bounding boxes se chevauchent
    if (bounds1.xMin < bounds2.xMax && bounds1.xMax > bounds2.xMin &&
        bounds1.yMin < bounds2.yMax && bounds1.yMax > bounds2.yMin) {
        return true;
    }
    return false;
}