/**
 * Interpolation class. Toolbox for many interpolation functions between two points in 1D space.
 */
class Interpolation {
    // Private members.
    #a;
    #b;

    /**
     * Creates an interpolation functions class between a and b.
     * @param {number} a The first point.
     * @param {number} b The second point.
     */
    constructor(a, b) {
        this.#a = a;
        this.#b = b;
    }

    /**
     * Performs linear interpolation between a and b.
     * @param {number} t The interpolation parameter (between 0 and 1).
     * @returns {number} The interpolated point at t.
     * 
     * @see https://en.wikipedia.org/wiki/Linear_interpolation
     */
    lerp(t) {
        if (t < 0) return this.#a;
        if (t > 1) return this.#b;
    
        return (this.#b - this.#a) * t + this.#a;
    }

    /**
     * Performs stepped linear interpolation between a and b.
     * @param {number} t The interpolation parameter (between 0 and 1).
     * @param {number} n The number of steps.
     * @param {boolean} [useFloor=true] Should use the floor function or the ceiling function (default to floor).
     * @returns {number} The interpolated point at t.
     * 
     * @see https://en.wikipedia.org/wiki/Linear_interpolation
     * @see https://en.wikipedia.org/wiki/Floor_and_ceiling_functions
     */
    steps(t, n, useFloor=true) {
        if (t < 0) return this.#a;
        if (t > 1) return this.#b;
    
        let mapped_t;
        if (useFloor) {
            mapped_t = Math.floor(t * n) / n;
        } else {
            mapped_t = Math.ceil(t * n) / n;
        }

        return this.lerp(mapped_t);
    }

    /**
     * Performs cubic interpolation between a and b.
     * @param {number} t The interpolation parameter (between 0 and 1).
     * @returns {number} The interpolated point at t.
     * 
     * @see https://en.wikipedia.org/wiki/Smoothstep
     */
    cubic(t) {
        if (t < 0) return this.#a;
        if (t > 1) return this.#b;
    
        return (this.#b - this.#a) * (3 - t * 2) * t * t + this.#a;
    }

    /**
     * Performs quintic interpolation between a and b.
     * @param {number} t The interpolation parameter (between 0 and 1).
     * @return {number} The interpolated point at t.
     * 
     * @see https://en.wikipedia.org/wiki/Smoothstep
     */
    smoother(t) {
        if (t < 0) return this.#a;
        if (t > 1) return this.#b;

        return (this.#b - this.#a) * (t * (t * 6 - 15) + 10) * t * t * t + this.#a;
    }
}