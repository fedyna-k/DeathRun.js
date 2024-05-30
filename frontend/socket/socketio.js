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
