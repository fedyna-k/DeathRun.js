const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
const path = require ('path');
app.use(express.json());

const characters = {};
app.use(express.static(path.join(__dirname, '../frontend')));
let pseudo;
let color;
 

// on récupère les infos du form
app.post('/users', (req, res) => {
    pseudo = req.body.pseudo;
    color = req.body.color;
    res.json({ message: 'data sent succesfuly' });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

let imposterId = null;
let sheriffId = null;

// on se connecte
io.on('connection', (socket) => {
    console.log('a user connected');

    // définition des rôles
    let roleAssigned = 'lambda';
    if (!imposterId) {
        imposterId = socket.id;
        roleAssigned = 'imposter';  // Le premier joueur devient l'imposteur
    } else if (!sheriffId && socket.id !== imposterId) {
        sheriffId = socket.id;
        roleAssigned = 'sheriff';  // Le deuxième joueur devient le shérif
    }
    const localPlayerId = socket.id;
    let xRand = Math.floor(Math.random() * (500 - 200 + 1)) + 200;
    characters[socket.id] = {
        id: socket.id,
        x: xRand,
        y: 300,
        color: color,
        pseudo: pseudo,
        role: roleAssigned,
        isGrabbed: false,
        lastGrab : 0,
    };   

    // changement d'action entre idle et courir
    socket.on('change action', (data) => {
        const { id, action } = data;
        if (characters[id]) {
            characters[id].action = action;
            io.emit('update character', characters[id]);
        }
    });

    // émission d'un nouveau personnages à toutes les sockets
    io.emit('new character', characters[socket.id]);


    socket.emit('init characters', Object.values(characters));

    socket.on('move character', (data) => {
        // Vérifier s'il y a au moins 2 joueurs connectés
        if (Object.keys(characters).length < 2) {
            io.emit('update character', characters[socket.id]);
            return;
        }

        if (characters[socket.id] && socket.id === localPlayerId && characters[socket.id].isGrabbed) {
            return;
        }
    
        if (characters[socket.id] && socket.id === localPlayerId) {
            characters[socket.id].x += data.x;
            characters[socket.id].y += data.y;
            Object.values(characters).forEach(otherChar => {
                if (otherChar.id !== data.id && checkCollision(characters[data.id], otherChar) && !otherChar.isGrabbed) {
                    resolveCollision(characters[data.id], otherChar);
                    io.emit('update character', otherChar);
                }
            }); 
            io.emit('update character', characters[socket.id]);
        }
    });


    socket.on('jump', (data) => {
        // Vérifier s'il y a au moins 2 joueurs connectés
        if (Object.keys(characters).length < 2) {
            io.emit('update character', characters[socket.id]);
            return;
        }
        if (characters[socket.id] && socket.id === localPlayerId){
            characters[socket.id].isGrabbed = false;
            io.emit('update character', characters[socket.id]);
        }
                
        if (characters[socket.id] && socket.id === localPlayerId) {
            io.emit('jumping', socket.id);
        }
    });

    socket.on('grab', (data) => {
        Object.values(characters).forEach(otherChar => {
            if (otherChar.id !== data.id && checkCollisionForGrabbing(characters[data.id], otherChar) && !characters[data.id].isGrabbed) {
                grab(characters[data.id], otherChar);
                otherChar.isGrabbed = true;
                io.emit('update character', otherChar);
                io.emit('update character', characters[socket.id]);
                setTimeout(() => {
                    otherChar.isGrabbed = false; // Relâche le personnage après 3 secondes
                    io.emit('update character', otherChar);
                }, 2000);
            }
        }); 
    });

    socket.on('update coords', (coord) => {
        characters[socket.id].x = coord.x;
        characters[socket.id].y = coord.y;
        Object.values(characters).forEach(otherChar => {
            if (otherChar.id !== socket.id && otherChar.isGrabbed) {
                otherChar.x = characters[socket.id].x;
                otherChar.y = characters[socket.id].y - 60;
                io.emit('update character', otherChar);
                io.emit('update character', characters[socket.id]);
            }
        }); 
    })

    socket.on('disconnect', () => {
        console.log('user disconnected');
        if (imposterId === socket.id) {
            imposterId = assignNewRole('imposter');
        } else if (sheriffId === socket.id) {
            sheriffId = assignNewRole('sheriff');
        }
        delete characters[socket.id];
        io.emit('remove character', socket.id);
    });
});



server.listen(3000, () => {
    console.log('listening on *:3000');
});


function resolveCollision(aggressor, victim) {
    let coords1 = {x: aggressor.x, y: aggressor.y};
    let coords2 = {x: victim.x, y: victim.y};

    // Calculer le vecteur direction entre les deux personnages
    let dx = coords2.x - coords1.x;
    let dy = coords2.y - coords1.y;

    // Calculer la distance entre les deux personnages
    let distance = Math.sqrt(dx * dx + dy * dy);

    // Si la distance est trop petite, éviter la division par zéro
    if (distance === 0) {
        distance = 1;
        dx = 1;
        dy = 0;
    }

    // Force de répulsion infligée et reçue
    let aggressorForce = 10; // Knockback standard reçu par l'agresseur
    let victimForce; // Knockback infligé au victime

    if (aggressor.role === 'imposter') {
        victimForce = 30; // Plus de knockback pour l'imposteur
    } else if (aggressor.role === 'sheriff') {
        victimForce = 25; // Moins de knockback que l'imposteur mais plus que lambda
    } else {
        victimForce = 15; // Lambda inflige moins de knockback
    }

    // Calculer le vecteur de répulsion pour chaque personnage
    let repulsionXAggressor = dx / distance * aggressorForce;
    let repulsionYAggressor = dy / distance * aggressorForce;

    let repulsionXVictim = dx / distance * victimForce;
    let repulsionYVictim = dy / distance * victimForce;

    // Repousser chaque personnage dans la direction opposée
    aggressor.x -= repulsionXAggressor;
    aggressor.y -= repulsionYAggressor;
    victim.x += repulsionXVictim;
    victim.y += repulsionYVictim;
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

function checkCollisionForGrabbing(character1, character2) {

    let bounds1 = {xMin: character1.x, xMax: character1.x + 20, yMin: character1.y, yMax: character1.y + 50};
    let bounds2 = {xMin: character2.x, xMax: character2.x + 20, yMin: character2.y, yMax: character2.y + 50};

    const padding = 15;
    // Calcul des nouvelles dimensions avec un 'padding' supplémentaire
    const paddedWidth1 = (bounds1.xMax - bounds1.xMin) + padding * 2;
    const paddedHeight1 = (bounds1.yMax - bounds1.yMin) + padding;

    // Déplacement du rectangle vers le haut et la gauche de 'padding' pixels
    const newX1 = bounds1.xMin - padding;
    const newY1 = bounds1.yMin - padding;

    bounds1 = {
        xMin: newX1,
        xMax: newX1 + paddedWidth1,
        yMin: newY1,
        yMax: newY1 + paddedHeight1
    };

    // Calcul des nouvelles dimensions avec un 'padding' supplémentaire
    const paddedWidth2 = (bounds2.xMax - bounds2.xMin) + padding * 2;
    const paddedHeight2 = (bounds2.yMax - bounds2.yMin) + padding;

    // Déplacement du rectangle vers le haut et la gauche de 'padding' pixels
    const newX2 = bounds2.xMin - padding;
    const newY2 = bounds2.yMin - padding;

    bounds2 = {
        xMin: newX2,
        xMax: newX2 + paddedWidth2,
        yMin: newY2,
        yMax: newY2 + paddedHeight2
    };

    // Vérifie si les bounding boxes se chevauchent
    if (bounds1.xMin < bounds2.xMax && bounds1.xMax > bounds2.xMin &&
        bounds1.yMin < bounds2.yMax && bounds1.yMax > bounds2.yMin) {
        return true;
    }
    return false;
}

function assignNewRole(oldRole) {
    const remainingIds = Object.keys(characters).filter(id => characters[id].role === 'lambda');
    if (remainingIds.length > 0) {
        const newRoleId = remainingIds[0];
        characters[newRoleId].role = oldRole;
        io.emit('update character', characters[newRoleId]);
        return newRoleId;
    }
    return null;
}

function grab(theGrabber, theOneGrabbed) {
    const grabberHeight = 60; 
    //sur les épaules
    theOneGrabbed.y = theGrabber.y - grabberHeight; // Placer sur les épaules 
}