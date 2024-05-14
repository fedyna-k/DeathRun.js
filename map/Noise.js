/**
 * Noise class, used to generate map.
 */
class Noise {
    #seed;
    #current;
    #maxStep;
    
    /**
     * Creates a new noise object used for procedural map generation.
     * @param {number} seed The initial random seed.
     * @param {number} initialValue The initial ground height.
     * @param {number} maxStep The maximum step allowed by the generator.
     */
    constructor(seed, initialValue, maxStep) {
        this.#seed = seed;  
        this.#current = initialValue;
        this.#maxStep = maxStep;
    }

    /**
     * Generate a new "random" value given the current seed.
     * The random generation uses the Borland C/C++ linear congruential generator.
     * 
     * @returns The next random value given by the seed.
     * 
     * @see https://en.wikipedia.org/wiki/Linear_congruential_generator
     */
    #random() {
        this.#seed *= 22695477;
        this.#seed += 1;
        this.#seed %= 2147483648;

        return (this.#seed & 1073741823) / 1073741823;
    }

    /**
     * Generate the next map height value.
     * @returns The next map height.
     */
    generateNext() {
        let randomStepScale = 2 * (this.#random() - 0.5);
        this.#current += this.#maxStep * randomStepScale;

        return this.#current;
    }
}

