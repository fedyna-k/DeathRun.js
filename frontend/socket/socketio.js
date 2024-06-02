var socket = io();

let charactersData = {};
let characterInstances = {};
let gameState = false;
let localPlayerId = null;
let animations = Character.loadAnimations(['red', 'blue', 'green', 'orange', 'purple', 'yellow']);

socket.on('init characters', function(initCharacters) {
    initCharacters.forEach(char => {
        createCharacter(char);
        if (char.id === socket.id) {
            localPlayerId = char.id;
        }
    });
    checkAndDisplayImpostorMessage();
    if (!hasAtLeastTwoPlayers()) {
        return;
    }
    gameState = true;

    
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
    if (characterInstances[char.id] && gameState) {
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

socket.on('game over', function(data) {
    if(data.winners === 'imposter'){
        displayMessage("THE GAME IS OVER.", "red", 50, 30);
        displayMessage("IMPOSTER WINS!", "red", 50, 40);
    }else {
        displayMessage("THE GAME IS OVER.", "blue", 50, 30);
        displayMessage("INNOCENTS WINS!", "blue", 50, 40);
    }
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
        else if (char.role === 'lambda' && char.id === localPlayerId) {
            displayMessage('YOU ARE AN INNOCENT', 'blue', 50, 30);
            displayConstantMessage('Innocent', 'blue');
        }
        else if (char.role === 'sheriff' && char.id === localPlayerId) {
            displayMessage('YOU ARE THE SHERIFF', 'green', 50, 30);
            displayConstantMessage('Sheriff', 'green');
        }
    });
}


function displayMessage(text, color = 'white', fontSize = 30, top = 20, timeout = 4000) {
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
        document.body.removeChild(messageDiv);
    }, timeout);
}



function displayConstantMessage(text, color = 'white') {
    const messageDiv = document.createElement('div');
    messageDiv.style.position = 'absolute';
    messageDiv.style.width = '100%';
    messageDiv.style.height = '50px';
    messageDiv.style.top = '20%'; 
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
        if (char.id === localPlayerId){
            displayMessage("YOU ARE DEAD", "red", 60, 60);
        }
        if (char.role === 'imposter'){
            displayMessage("THE GAME IS OVER.", "blue", 50, 30, 10000)
            displayMessage("INNOCENTS WIN !", "blue", 50, 40, 10000)
            gameState = false;
            io.emit('game over', { winner: 'innocents' });
        }
        let lambdaOrSheriffAlive = false;

        for (const id in charactersData) {
            if (charactersData[id].role === 'lambda' || charactersData[id].role === 'sheriff') {
                lambdaOrSheriffAlive = true;
                break;
            }
        }

        if (!lambdaOrSheriffAlive) {
            displayMessage("THE GAME IS OVER.", "red", 50, 30, 10000);
            displayMessage("IMPOSTER WINS!", "red", 50, 40, 10000);
            gameState = false;
            io.emit('game over', { winner: 'imposter' });
        }
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
