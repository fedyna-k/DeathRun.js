const threshold = 0.4;

/**
 * Noise class, used to generate map.
 */
class Noise {
    #seed;
    #current;
    #maxStep;

    static get threshold() { return threshold; }
    
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
     * Get the terrain type as the number of 1s in the seed modulo 4 in constant time and memory space.
     * @returns The terrain type.
     * 
     * @see https://web.archive.org/web/20151229003112/http://blogs.msdn.com/b/jeuge/archive/2005/06/08/hakmem-bit-count.aspx
     */
    getTerrainTypeFlag() {
        let bitCount = this.#seed - ((this.#seed >> 1) & 0o33333333333) - ((this.#seed >> 2) & 0o11111111111);
        let flag = (((bitCount + (bitCount >> 3)) & 0o30707070707) % 63) % 4;

        return ["lerp", "steps", "cubic", "smoother"][flag];
    }

    /**
     * Generate the next map height value.
     * @returns The next map height.
     */
    generateNext() {
        // Create the random step
        let randomStepScale = 2 * (this.#random() - 0.5);
        // Add flat surfaces on small variations
        randomStepScale = Math.abs(randomStepScale) < threshold ? 0 : randomStepScale;
        // Update surface height
        this.#current += this.#maxStep * randomStepScale;

        return this.#current;
    }
}