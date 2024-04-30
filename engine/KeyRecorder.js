class KeyRecorder {
    #keys = {};

    /**
     * Creates a new KeyRecorder, it records all key pressed on the keyboard when element is focused.
     * @param {HTMLElement} element One of the DOM elements
     */
    constructor(element) {
        element.addEventListener("keydown", event => {
            this.#keys[event.key] = true;
            event.preventDefault();
        })

        element.addEventListener("keyup", event => {
            delete this.#keys[event.key];
            event.preventDefault();
        })
    }

    /**
     * Checks if a key is pressed.
     * @param {KeyboardEvent.key} key The key to check
     * @returns {boolean} Is the key currently pressed ?
     */
    isPressed(key) {
        return this.#keys[key] == true;
    }

    /**
     * Compute the difference in x according to keypress.
     * @returns The difference in x for the current player.
     */
    updateX() {
        let delta = 0;

        if (this.isPressed("ArrowLeft")) {
            delta -= 1;
        }
        if (this.isPressed("ArrowRight")) {
            delta += 1;
        }

        return delta;
    }
}