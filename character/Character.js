class Character {
    #x;
    #y;
    #updater;

    /**
     * Creates a new character on screen (currently a box).
     * @param {number} x The initial x coordinate.
     * @param {number} y The initial y coordinate.
     * @param {KeyRecorder|ServerUpdater} updater The character updater (KeyRecorder for the player, ServerUpdater for the other guys).
     */
    constructor(x, y, updater) {
        this.#x = x;
        this.#y = y;
        this.#updater = updater;
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
     */
    draw() {
        ctx.globalCompositeOperation = "soft-light";
        ctx.fillStyle = "white";
        ctx.fillRect(this.#x - 10, this.#y, 20, 50)
        ctx.globalCompositeOperation = "source-over"
    }

    /**
     * Update the coordinates, not that fancy for the moment.
     */
    update() {
        let deltaX = this.#updater.updateX();
        this.#x += deltaX;
    }

    /**
     * Clip the character on the ground below him.
     * @param {{object: Ground, args: any}} ground The ground below the character.
     */
    clip(ground) {
        this.#y = ground.object.getPointAt(this.#x, ground.args) - 50;
    }
}