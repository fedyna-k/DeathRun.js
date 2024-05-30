var socket = io();

let charactersData = {};
let characterInstances = {};

let localPlayerId = null;


socket.on('init characters', function(initCharacters) {
    initCharacters.forEach(char => {
        createCharacter(char);
        if (char.id === socket.id) {
            localPlayerId = char.id;
            renderer.setViewport(char.x, char.y);
            console.log("role du perso : ", char.id, ": " , char.role)
        }
    });
});

socket.on('new character', function(char) {
    if (!characterInstances[char.id]) {
        createCharacter(char);
    }
});

socket.on('update character', function(char) {
        updateCharacterPosition(char);

});

socket.on('remove character', function(charId) {
    if (characterInstances[charId]) {
        removeCharacter(charId);
        delete characterInstances[charId];
        delete charactersData[charId];
    }
});

document.addEventListener('keydown', function(event) {
    if (event.key === 'e' || event.key === 'E') {
        if (localPlayerId === trapperId && isNearButton(characterInstances[localPlayerId], button)) {
            socket.emit('activate button', { buttonId: 1 });
        }
    }
});

// Vérifier la proximité du bouton
function isNearButton(character, button) {
    return Math.abs(character.getCoordinates().x - button.x) < 50 && Math.abs(character.getCoordinates().y - button.y) < 50;
}

// Réagir à l'activation du bouton
socket.on('button activated', function(data) {
    console.log(`Le bouton ${data.buttonId} a été activé.`);
});





function createCharacter(char) {
    if (!characterInstances[char.id]) {
        let player = new Character(char.x, char.y, char.color); 
        renderer.insertCharacterIntoPipeline(player);
        characterInstances[char.id] = player;
        charactersData[char.id] = char;

    }
}

function updateCharacterPosition(char) {
    if (characterInstances[char.id] && characterInstances[char.id] instanceof Character) {
        characterInstances[char.id].setPosition(char.x, char.y);
        charactersData[char.id] = char;
    } 

    if (char.id === localPlayerId) {
        renderer.setViewport(char.x, char.y);
    }

    
}

function removeCharacter(charId) {
    if (characterInstances[charId]) {
        renderer.removeCharacterFromPipeline(characterInstances[charId]);
        delete characterInstances[charId];
        delete charactersData[charId];
    }
}
