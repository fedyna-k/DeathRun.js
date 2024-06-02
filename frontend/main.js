

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
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


function handleInput() {
    if (keyState["ArrowLeft"]) {
        socket.emit('move character', { id: localPlayerId, x: -10, y: 0 });
    }
    if (keyState["ArrowRight"]) {
        socket.emit('move character', { id: localPlayerId,  x: 10, y: 0 });
    }
    if (keyState[" "]) {
        socket.emit('move character', { id: localPlayerId,  x: 0, y: -1 });
    }
    if (keyState["e"] ||keyState["E"]){
        socket.emit('grab character', {id: localPlayerId});
    }
}

setInterval(handleInput, 1000 / 30);

    // map 1 : 
    let map1 = [
        new Ground([200, 350], [250, 350], "cubic"),
        new Ground([300, 400], [350, 390], "lerp"),
        new Ground([550, 320], [600, 330], "smoother"),
        new Ground([650, 270], [700, 275], "cubic"),
        new Ground([400, 180], [450, 180], "cubic"),
    ];

    // map 2 : 
    let map2 = [
        new Ground([300, 100], [480, 100], "cubic"),
        new Ground([250, 400], [350, 370], "smoother"),
        new Ground([400, 240], [450, 250], "smoother"),
    ];

    // map 3:
    let map3 = [
        new Ground([300, 100], [480, 100], "cubic"),
        new Ground([250, 400], [350, 370], "smoother"),
        new Ground([400, 240], [450, 250], "smoother"),
        new Ground([120, 300], [170, 300], "cubic"),
        new Ground([440, 330], [490, 330], "cubic"),
    ];

    
    let maps = [map1, map2, map3];
    let randomIndex = Math.floor(Math.random() * maps.length);
    let platforms = maps[randomIndex];

    platforms.forEach(platform => {
        renderer.insertGroundIntoPipeline(platform, [20, false]);
    });
    noise = Math.floor(Math.random() * 9999) + 1;
    let heightNoise = new Noise(noise, 500, 40);
    let firstHeight = 500;
    let secondHeight = heightNoise.generateNext();

    for (let i = 1 ; i < 4 ; i++) {
        let ground = new Ground([i * 160, firstHeight], [(i+1) * 160, secondHeight], heightNoise.getTerrainTypeFlag());
        firstHeight = secondHeight;
        secondHeight = heightNoise.generateNext();

        renderer.insertGroundIntoPipeline(ground, [5, false]);
    }

let white = new Light(1000);
renderer.addLightSource(white, "w");
renderer.insertLightIntoPipeline("w", 100, 100, 1, Math.PI);

renderer.toggleFPSrendering();  
renderer.run();