class Renderer {
    #context;
    #width;
    #height;
    #renderer;

    #lightPipeline = [];
    #lightMap = {};
    

    #objectPipeline = [];

    #charactersPipeline = [];

    #groundPipeline = [];
    #wallPipeline = [];

    #frameCounter = 0;
    #savedCounter = "---";
    #lastTime = new Date();
    #mustRenderFPS = false;

    #viewportX = 0;
    #viewportY = 0;

    

    #x = 0;
    #y = 0;

    /**
     * Creates new renderer based on context2D.
     * @param {CanvasRenderingContext2D} context The context2D from the canvas.
     * @param {number} width The canvas width.
     * @param {number} height The canvas height.
     */
    constructor(context, width, height) {
        this.#context = context;
        this.#width = width;
        this.#height = height;
    }


    setViewport(x, y) {
        this.#viewportX = x - this.#width / 2;
        this.#viewportY = y - this.#height / 2;
    }


    /**
     * Toggle the FPS rendering.
     */
    toggleFPSrendering() {
        this.#savedCounter = "---";
        this.#mustRenderFPS = !this.#mustRenderFPS;
    }

    /**
     * Renders the FPS counter
     */    
    #renderFPS() {
        this.#frameCounter++;

        if (new Date() - this.#lastTime >= 1000) {
            this.#lastTime = new Date();
            this.#savedCounter = this.#frameCounter;
            this.#frameCounter = 0;
        }

        this.#context.fillStyle = "white";
        this.#context.fillText(`FPS: ${this.#savedCounter}`, 10, 15);
    }

    /**
     * Starts rendering.
     */
    run() {
        this.#renderer = setInterval(() => {this.#core.apply(this)});
    }

    /**
     * Stops rendering.
     */
    stop() {
        clearInterval(this.#renderer);
    }

    /**
     * Adds a new light source that can then be used by the light pipeline.
     * @param {Light} light The new light source.
     * @param {string} key The unique key for the light source.
     */
    addLightSource(light, key) {
        this.#lightMap[key] = light;
    }

    /**
     * Remove a light source. Note that it will also remove all lights from the pipeline.
     * @param {string} key The unique key for the light source.
     */
    removeLightSource(key) {
        delete this.#lightMap[key];
        this.removeLightsFromPipeline(key);
    }

    /**
     * Add a new light into the pipeline, using the light sources added beforehand.
     * @param {string} lightKey The unique key as defined for the addLightSource function.
     * @param {number} x The x coordinate in space.
     * @param {number} y The y coordinate in space.
     * @param {number} lightAngle Sets the angle of the light source (default is PI / 2).
     * @param {number} spreadAngle Sets the light speading angle (default is PI).
     */
    insertLightIntoPipeline(lightKey, x, y, lightAngle=Math.PI/2, spreadAngle=Math.PI) {
        this.#lightPipeline.push({
            key: lightKey,
            x: x,
            y: y,
            lightAngle: lightAngle,
            spreadAngle: spreadAngle
        });
    }

    /**
     * Remove all lights sources matching the given filter.
     * @param {string} lightKey The unique key as defined for the addLightSource function ("" for no filter).
     * @param {number} x The x coordinate in space (-1 for no filter).
     * @param {number} y The y coordinate in space (-1 for no filter).
     */
    removeLightsFromPipeline(lightKey="", x=-1, y=-1) {
        this.#lightPipeline = this.#lightPipeline.filter(elem => elem.lightKey != lightKey && elem.x != x && elem.y != y);
    }

    /**
     * Add a new ground inside the ground pipeline. Will only be drawn if visible.
     * @param {Ground} ground The new ground to add.
     * @param {undefined|[number, undefined|boolean]} args The interpolation function arguments.
     */
    insertGroundIntoPipeline(ground, args) {
        this.#groundPipeline.push({
            object: ground,
            args: args
        });
    }

    /**
     * Adds a character inside the character pipeline.
     * @param {Character} character The character to display
     */
    insertCharacterIntoPipeline(character) {
        this.#charactersPipeline.push(character);
    }

    /**
     * Removes a character from the character pipeline.
     * @param {Character} character The character to remove
     */
    removeCharacterFromPipeline(character) {
        this.#charactersPipeline = this.#charactersPipeline.filter(char => char !== character);
    }    

    /**
     * Check if character is on any platform.
     */
    isCharacterOnPlatform(character) {
        const charY = character.position().y;
        if(charY > 700){
            return false;
        }return true;
    }

    /**
     * The rendering core is where all the pipelines are rendered.
     * The rendering order is :
     * - Lights
     * - Objects
     * - Players
     * - Ground
     * - Walls
     */
    #core() {
        // Empty screen
        this.#context.fillStyle = "black";
        this.#context.fillRect(0, 0, this.#width, this.#height);
        // this.#context.translate(-this.#viewportX, -this.#viewportY);
    
        // Render the light pipeline.
        for (let light of this.#lightPipeline) {
            if (this.#lightMap[light.key]) {
                this.#lightMap[light.key].draw(this.#context, light.x, light.y, light.lightAngle, light.spreadAngle);
            }
        }
    
        for (let character of this.#charactersPipeline) {
            if (character) {
                let charX = character.position().x;
                let groundsUnder = this.#groundPipeline.filter(ground => ground.object.getXBounds().min <= charX && charX <= ground.object.getXBounds().max);
    
                // Find the nearest platform below the character
                let relevantGround = null;
                let minDistance = Infinity;
                for (let ground of groundsUnder) {
                    let groundY = ground.object.getPointAt(charX, ground.args);
                    let distance = groundY - character.position().y;
                    if (distance >= 0 && distance < minDistance) {
                        minDistance = distance;
                        relevantGround = ground;
                    }
                }
    
                if (relevantGround) {
                    character.update(relevantGround);
                    character.clip(relevantGround);
                } else {
                    character.update(null);
                }
    
                character.draw(this.#context, relevantGround);
                character.drawHitbox(this.#context);
            }
        }
    
        // Render the ground pipeline.
        this.#context.fillStyle = "black";
        for (let ground of this.#groundPipeline) {
            ground.object.draw(this.#context, ground.args);
        }
    
        // If wanted, render and compute fps
        if (this.#mustRenderFPS) {
            this.#renderFPS();
        }
    }
}