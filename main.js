const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 800;


let keyRecorder = new KeyRecorder(document);
let player = new Character(200, 200, keyRecorder);

let renderer = new Renderer(ctx, canvas.width, canvas.height);

let white = new Light(150);
renderer.addLightSource(white, "w");
renderer.insertLightIntoPipeline("w", 200, 200, 1, Math.PI);

let ground = new Ground([0, 400], [400, 200], "steps");
let ceil = new Ground([0, 280], [400, 130], "smoother", true);
renderer.insertGroundIntoPipeline(ground, [20, false]);
renderer.insertGroundIntoPipeline(ceil);

renderer.insertCharacterIntoPipeline(player);

renderer.toggleFPSrendering();

renderer.run();