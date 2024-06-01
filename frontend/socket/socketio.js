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

    checkAndDisplayImpostorMessage();
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
    

function checkAndDisplayImpostorMessage() {
    Object.values(charactersData).forEach(char => {
        if (char.role === 'imposter' && char.id === localPlayerId) {
            displayImpostorMessage();
        }
    });
}

function displayImpostorMessage() {
    const messageDiv = document.createElement('div');


    messageDiv.style.position = 'absolute';
    messageDiv.style.width = '100%';
    messageDiv.style.height = '50px';
    messageDiv.style.top = '30%';
    messageDiv.style.left = '0';
    messageDiv.style.transform = 'translateY(-50%)';
    messageDiv.style.textAlign = 'center';
    messageDiv.style.color = 'red';
    messageDiv.style.fontSize = '50px';
    messageDiv.style.fontWeight = 'bold';
    messageDiv.style.opacity = '1';
    messageDiv.style.transition = 'opacity 1s ease';
    messageDiv.innerText = 'YOU ARE THE IMPOSTOR';
    document.body.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.style.opacity = '0';
    }, 2000);

    setTimeout(() => {
        document.body.removeChild(messageDiv);
    }, 5000);
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
        checkAndDisplayImpostorMessage();
    }
}
