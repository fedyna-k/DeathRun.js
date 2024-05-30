/**
 * Ground class. Can be used to display and compute grounds
 */
class Ground {
    #xa;
    #xb;

    #ys;
    #yLimit;

    #interpolationFunction;
    #rotationFunction;

    /**
     * Create a ground object
     * @param {[number, number]} pointA The first ground point (must be before B according to x).
     * @param {[number, number]} pointB The second ground point (must be after A according to x).
     * @param {"lerp"|"steps"|"cubic"|"smoother"} interpolationType The interpolation function we want to use.
     * @param {boolean} [inverted=false] Is the ground inverted (that case becoming a roof).
     */
    constructor(pointA, pointB, interpolationType, inverted=false) {
        this.#xa = pointA[0];
        this.#xb = pointB[0];

        this.#ys = new Interpolation(pointA[1], pointB[1]);
        this.#yLimit = inverted ? Math.min(pointA[1], pointB[1]) : Math.max(pointA[1], pointB[1]);

        this.#interpolationFunction = this.#getInterpolationFunction(interpolationType);
        this.#rotationFunction = this.#getRotationFunction(interpolationType);
    }

    /**
     * Gets the interpolation function for the corresponding type.
     * @param {"lerp"|"steps"|"cubic"|"smoother"} interpolationType The interpolation function we want to use.
     * @returns {function} The correct interpolation function.
     */
    #getInterpolationFunction(interpolationType) {
        if (interpolationType == "lerp") {
            return this.#ys.lerp;
        }
        if (interpolationType == "steps") {
            return this.#ys.steps;
        }
        if (interpolationType == "cubic") {
            return this.#ys.cubic;
        }
        if (interpolationType == "smoother") {
            return this.#ys.smoother;
        }
    }

    /**
     * Gets the rotation function for the corresponding type.
     * @param {"lerp"|"steps"|"cubic"|"smoother"} interpolationType The interpolation function we want to use.
     * @returns {function} The correct rotation function.
     */
    #getRotationFunction(interpolationType) {
        if (interpolationType == "lerp") {
            return this.#ys.lerpRotation;
        }
        if (interpolationType == "steps") {
            return this.#ys.stepsRotation;
        }
        if (interpolationType == "cubic") {
            return this.#ys.cubicRotation;
        }
        if (interpolationType == "smoother") {
            return this.#ys.smootherRotation;
        }
    }

    /**
     * Draw the ground according to the given function.
     * @param {CanvasRenderingContext2D} context The canvas rendering context.
     * @param {undefined|[number, undefined|boolean]} args The interpolation function arguments.
     */
    draw(context, args) {
        for (let x = this.#xa ; x <= this.#xb ; x++) {
            let interpolatedY = this.getPointAt(x, args);

            if (this.#yLimit > interpolatedY) {
                context.fillRect(x, interpolatedY, 1, this.#yLimit - interpolatedY);            
            } else {
                context.fillRect(x, this.#yLimit, 1, interpolatedY - this.#yLimit);
            }
        }
    }

    /**
     * Give the y corresponding to the provided x.
     * @param {number} x The x coordinate we want to interpolate.
     * @param {undefined|[number, undefined|boolean]} args The interpolation function arguments.
     */
    getPointAt(x, args) {
        let t = (x - this.#xa) / (this.#xb - this.#xa);

        if (args !== undefined) {
            return this.#interpolationFunction.apply(this.#ys, [t, ...args]);
        } else {
            return this.#interpolationFunction.apply(this.#ys, [t]);
        }
    }

    /**
     * Give the rotation vector at a provided x.
     * @param {number} x The x coordinate we want to compute the rotation vector at.
     */
    getRotationAt(x) {
        let t = (x - this.#xa) / (this.#xb - this.#xa);

        return this.#rotationFunction.apply(this.#ys, [t, this.#xb - this.#xa]);
    }
}