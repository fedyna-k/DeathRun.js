const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");


canvas.width = 800;
canvas.height = 800;

let renderer = new Renderer(ctx, canvas.width, canvas.height);
let ground = new Ground([0, 400], [800, 400], "lerp");


const keyState = {};


document.addEventListener('keydown', function(event) {
    keyState[event.key] = true;
});

document.addEventListener('keyup', function(event) {
    keyState[event.key] = false;
});


function handleInput() {
    if (keyState["ArrowLeft"]) {
        socket.emit('move character', { x: -10, y: 0 });
    }
    if (keyState["ArrowRight"]) {
        socket.emit('move character', { x: 10, y: 0 });
    }
    if (keyState[" "]) {
        socket.emit('move character', { x: 0, y: -1 });
    }
}

setInterval(handleInput, 1000 / 30);


let white = new Light(1000);
renderer.addLightSource(white, "w");
renderer.insertLightIntoPipeline("w", 200, 200, 1, Math.PI);

renderer.insertGroundIntoPipeline(ground, [20, false]);
renderer.toggleFPSrendering();  
renderer.run();

