var socket = io();

let charactersData = {};
let characterInstances = {};

let localPlayerId = null;
let animations = Character.loadAnimations(['red', 'blue', 'green', 'orange', 'purple', 'yellow']);

socket.on('init characters', function(initCharacters) {
    initCharacters.forEach(char => {
        createCharacter(char);
        if (char.id === socket.id && renderer) {
            localPlayerId = char.id;
            renderer.setViewport(char.x, char.y);
        }
    });
    checkAndDisplayImpostorMessage();

    if (!hasAtLeastTwoPlayers()) {
        return;
    }
});

socket.on('new character', function(char) {
    if (!characterInstances[char.id]) {
        createCharacter(char);
    }
});

socket.on('update character', function(char) {
    if (!hasAtLeastTwoPlayers()) {
        displayMessage('Not enough player to play', 'white', 50, 15);
        return;
    }
    if (characterInstances[char.id]) {
        characterInstances[char.id].updateState(char.action); 
        characterInstances[char.id].setPosition(char.x, char.y);
    }
        updateCharacterPosition(char);
});

socket.on('remove character', function(charId) {
    if (characterInstances[charId]) {
        removeCharacter(charId);
        delete characterInstances[charId];
        delete charactersData[charId];
    }
});

socket.on('jumping', function(charId){
    characterInstances[charId].jump();
});

function createCharacter(char) {
    if (!characterInstances[char.id] && renderer) {
        let player = new Character(char.x, char.y,"#ff0000", animations); 
        renderer.insertCharacterIntoPipeline(player);
        characterInstances[char.id] = player;
        charactersData[char.id] = char;
    }
}
    

function checkAndDisplayImpostorMessage() {
    Object.values(charactersData).forEach(char => {
        if (char.role === 'imposter' && char.id === localPlayerId) {
            displayMessage('YOU ARE THE IMPOSTOR', 'red', 50, 30);
            displayConstantMessage('Impostor', 'red');
        }
        if (char.role === 'lambda' && char.id === localPlayerId) {
            displayMessage('YOU ARE AN INNOCENT', 'blue', 50, 30);
            displayConstantMessage('Innocent', 'blue');
        }
    });
}


function displayMessage(text, color = 'white', fontSize = 30, top = 20) {
    const messageDiv = document.createElement('div');
    messageDiv.style.position = 'absolute';
    messageDiv.style.width = '100%';
    messageDiv.style.height = '50px';
    messageDiv.style.top = `${top}%`; 
    messageDiv.style.left = '0';
    messageDiv.style.transform = 'translateY(-50%)';
    messageDiv.style.textAlign = 'center';
    messageDiv.style.color = color;
    messageDiv.style.fontSize = `${fontSize}px`;
    messageDiv.style.fontWeight = 'bold';
    messageDiv.style.opacity = '1';
    messageDiv.style.transition = 'opacity 1s ease';
    messageDiv.innerText = text;
    document.body.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.style.opacity = '0';
    }, 3000);

    setTimeout(() => {
        document.body.removeChild(messageDiv);
    }, 4000);
}



function displayConstantMessage(text, color = 'white') {
    const messageDiv = document.createElement('div');
    messageDiv.style.position = 'absolute';
    messageDiv.style.width = '100%';
    messageDiv.style.height = '50px';
    messageDiv.style.top = '10%'; 
    messageDiv.style.left = '100';
    messageDiv.style.transform = 'translateY(-50%)';
    messageDiv.style.textAlign = 'center';
    messageDiv.style.color = color;
    messageDiv.style.fontSize = `20px`;
    messageDiv.style.fontWeight = 'bold';
    messageDiv.innerText = text;
    document.body.appendChild(messageDiv);
}

function updateCharacterPosition(char) {
    if (characterInstances[char.id] && characterInstances[char.id] instanceof Character) {
        characterInstances[char.id].setPosition(char.x, char.y);
        charactersData[char.id] = char;
    } 

    // Check if character is on a platform
    if (renderer && !renderer.isCharacterOnPlatform(characterInstances[char.id])) {
        removeCharacter(char.id);
        displayMessage("YOU ARE DEAD", "red", 60, 35);
    }

    
}

function removeCharacter(charId) {
    if (characterInstances[charId] && renderer) {
        renderer.removeCharacterFromPipeline(characterInstances[charId]);
        delete characterInstances[charId];
        delete charactersData[charId];
    }
}

function hasAtLeastTwoPlayers() {
    return Object.keys(charactersData).length >= 2;
}
