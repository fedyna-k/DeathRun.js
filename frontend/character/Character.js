class Character {
    #x;
    #y;
    #color;
    #velocityY;
    #isJumping;
    #gravity = 0.2;

    /**
     * Creates a new character on screen (currently a box).
     * @param {number} x The initial x coordinate.
     * @param {number} y The initial y coordinate.
     */
    constructor(x, y, color) {
        this.#x = x;
        this.#y = y;
        this.#color = color;
        this.#velocityY = 0; 
        this.#isJumping = false;
    }


    /**
     * Get the character's coordinates.
     * @returns {{x: number, y: number}} The coordinates as an Object.
     */
    getCoordinates() {
        return {x: this.#x, y: this.#y};
    }

    /**
     * Draws the beautiful box guy.
     * @param {{object: Ground, args: any}} ground The ground below the character.
     */
    draw(ground) {
        let rotationAngle = ground.object.getRotationAt(this.#x);
        
        
        ctx.globalCompositeOperation = "soft-light";
        ctx.fillStyle = this.#color;

        ctx.translate(this.#x, this.#y + 50);
        ctx.rotate(rotationAngle);
        ctx.translate(-this.#x, -this.#y - 50);

        ctx.fillRect(this.#x - 10, this.#y, 20, 50);

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalCompositeOperation = "source-over";
    }

    /**
     * Update the coordinates, not that fancy for the moment.
     */
    update(ground) {
        if (this.#isJumping) {
            this.#velocityY += this.#gravity; // Applique la gravité
            this.#velocityY *= 0.99;
            this.#y += this.#velocityY; 

            let groundY = ground.object.getPointAt(this.#x, ground.args);
            // Collision avec le sol
            if (this.#y > groundY - 50) { 
                this.#y = groundY - 50;
                this.#isJumping = false;
                this.#velocityY = 0;
            }
        }
   }

   jump() {
    if (!this.#isJumping) {
        this.#isJumping = true;
        this.#velocityY = -10; 
    }
}

    /**
     * Sets the character's coordinates.
     * @param {number} x The new x coordinate.
     * @param {number} y The new y coordinate.
     */
    setPosition(x, y) {
        this.#x = x;
        if (y === -1 && !this.#isJumping) { 
            this.jump();
        } else {
            this.update();
        }
    }

    /**
     * Clip the character on the ground below him.
     * @param {{object: Ground, args: any}} ground The ground below the character.
     */
    clip(ground) {
        if(!this.#isJumping){
            this.#y = ground.object.getPointAt(this.#x, ground.args) - 50;
        }
    }
}