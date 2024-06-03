const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false; // Disable smoothing to keep edges crisp
ctx.imageSmoothingQuality = 'high';
canvas.width = 800;
canvas.height = 800;

let renderer = new Renderer(ctx, canvas.width, canvas.height);
    
const keyState = {};

document.addEventListener('keydown', function(event) {
    keyState[event.key] = true;
});

document.addEventListener('keyup', function(event) {
    keyState[event.key] = false;
});

let lastGrabTime = 0;

function handleInput() {
    let action = null;
    socket.emit('update coords', {x: characterInstances[localPlayerId].getCoordinates().x, y: characterInstances[localPlayerId].getCoordinates().y})
    if (keyState["q"] || keyState["ArrowLeft"]) {
        socket.emit('move character', { id: localPlayerId, x: -10, y: 0});
        action = 'run-left';
    } else if (keyState["d"] || keyState["ArrowRight"]) {
        socket.emit('move character', { id: localPlayerId, x: 10, y: 0 });
        action = 'run';
    }

    if (keyState[" "]) {
        socket.emit('jump', { id: localPlayerId});
        action = 'jump';
    }

    if (keyState["e"] || keyState["E"] && Date.now() - lastGrabTime >= 3000) {
        socket.emit('grab', { id: localPlayerId});
        lastGrabTime = Date.now();
    }

    // Check if no keys relevant to actions are pressed
    if (!action && !Object.values(keyState).some(value => value)) {
        action = 'idle';
    }

    if (action) {
        socket.emit('change action', { id: localPlayerId, action: action });
    }
}


function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    console.log('Query variable %s not found', variable);
}


const pseudo = getQueryVariable('pseudo');
const color = getQueryVariable('color');

// Appel à handleInput 30 fois par seconde
setInterval(handleInput, 1000 / 30);

// map 1 : 
let map1 = [
    new Ground([200, 350], [250, 350], "cubic"),
    new Ground([300, 400], [350, 390], "lerp"),
    new Ground([550, 320], [600, 330], "smoother"),
    new Ground([650, 270], [700, 275], "cubic"),
    new Ground([400, 180], [450, 180], "cubic"),
];

// // map 2 : 
// let map2 = [
//     new Ground([300, 100], [480, 100], "cubic"),
//     new Ground([250, 400], [350, 370], "smoother"),
//     new Ground([400, 240], [450, 250], "smoother"),
// ];

// // map 3:
// let map3 = [
//     new Ground([300, 100], [480, 100], "cubic"),
//     new Ground([250, 400], [350, 370], "smoother"),
//     new Ground([400, 240], [450, 250], "smoother"),
//     new Ground([120, 300], [170, 300], "cubic"),
//     new Ground([440, 330], [490, 330], "cubic"),
// ];


// let maps = [map1, map2, map3];
// let randomIndex = Math.floor(Math.random() * maps.length);
// let platforms = maps[randomIndex];
platforms = map1;

platforms.forEach(platform => {
    renderer.insertGroundIntoPipeline(platform, [20, false]);
});
// noise = Math.floor(Math.random() * 9999) + 1;
let heightNoise = new Noise(12, 500, 40);
let firstHeight = 500;
let secondHeight = heightNoise.generateNext();

for (let i = 1 ; i < 4 ; i++) {
    let ground = new Ground([i * 160, firstHeight], [(i+1) * 160, secondHeight], heightNoise.getTerrainTypeFlag());
    firstHeight = secondHeight;
    secondHeight = heightNoise.generateNext();

    renderer.insertGroundIntoPipeline(ground, [5, false]);
}

let light = new Light(1500);
renderer.addLightSource(light, "w");
renderer.insertLightIntoPipeline("w", 100, 100, 0, 2*Math.PI);

renderer.toggleFPSrendering();  
renderer.run();