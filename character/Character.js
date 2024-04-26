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
        let deltaY = this.#updater.updateY();
        this.#x += deltaX;
        this.#y += deltaY;
    }
}