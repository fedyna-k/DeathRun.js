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
     * @returns {number} The interpolated point at t.
     * 
     * @see https://en.wikipedia.org/wiki/Smoothstep
     */
    smoother(t) {
        if (t < 0) return this.#a;
        if (t > 1) return this.#b;

        return (this.#b - this.#a) * (t * (t * 6 - 15) + 10) * t * t * t + this.#a;
    }

    /**
     * Get the rotation angle (using the normal vector) for a linear interpolation between a and b.
     * @param {number} t The interpolation parameter (between 0 and 1).
     * @param {number} xLength The ground length in terms of X.
     * @returns {number} The rotation angle at t.
     * 
     * @see https://en.wikipedia.org/wiki/Linear_interpolation
     */
    lerpRotation(t, xLength) {
        if (t < 0 || t > 1) return 0;

        let derivative = this.#b - this.#a;
        return 1.5 * Math.PI + Math.acos(-derivative / Math.sqrt(derivative * derivative + xLength * xLength));
    }

    /**
     * Get the rotation angle (using the normal vector) for a stepped linear interpolation between a and b.
     * @param {number} t The interpolation parameter (between 0 and 1).
     * @param {number} xLength The ground length in terms of X.
     * @returns {number} The rotation angle at t.
     * 
     * @see https://en.wikipedia.org/wiki/Linear_interpolation
     * @see https://en.wikipedia.org/wiki/Floor_and_ceiling_functions
     */
    stepsRotation(t, xLength) {
        return 0;
    }

    /**
     * Get the rotation angle (using the normal vector) for a cubic interpolation between a and b.
     * @param {number} t The interpolation parameter (between 0 and 1).
     * @param {number} xLength The ground length in terms of X.
     * @returns {number} The rotation angle at t.
     * 
     * @see https://en.wikipedia.org/wiki/Smoothstep
     */
    cubicRotation(t, xLength) {
        if (t < 0 || t > 1) return 0;
    
        let derivative = (this.#b - this.#a) * 6 * (t - t * t);
        return 1.5 * Math.PI + Math.acos(-derivative / Math.sqrt(derivative * derivative + xLength * xLength));
    }

    /**
     * Get the rotation angle (using the normal vector) for a quintic interpolation between a and b.
     * @param {number} t The interpolation parameter (between 0 and 1).
     * @param {number} xLength The ground length in terms of X.
     * @returns {number} The rotation angle at t.
     * 
     * @see https://en.wikipedia.org/wiki/Smoothstep
     */
    smootherRotation(t, xLength) {
        if (t < 0 || t > 1) return 0;

        let derivative = (this.#b - this.#a) * 30 * (t - t * t) * (t - t * t);
        return 1.5 * Math.PI + Math.acos(-derivative / Math.sqrt(derivative * derivative + xLength * xLength));
    }
}