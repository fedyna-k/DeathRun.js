/**
 * Light class. Allow to create efficient industry-like lights.
 */
class Light {
    #r;
    #g;
    #b;
    #radius;

    /**
     * Create a new light source that can be placed multiple times.
     * @param {number} radius The light source radius.
     * @param {number} r The light's red component.
     * @param {number} g The light's green component.
     * @param {number} b The light's blue component .
     */
    constructor(radius, r=255, g=255, b=255) {
        this.#r = r;
        this.#g = g;
        this.#b = b;
        this.#radius = radius; 
    }

    /**
     * Place a light source at given coordinates.
     * @param {CanvasRenderingContext2D} context The canvas context.
     * @param {number} x The x coordinate in pixel space.
     * @param {number} y The y coordinate in pixel space.
     * @param {number} lightAngle Sets the angle of the light source (default is PI / 2).
     * @param {number} spreadAngle Sets the light speading angle (default is PI).
     */
    draw(context, x, y, lightAngle=Math.PI/2, spreadAngle=Math.PI) {
        let gradient = context.createRadialGradient(x, y, 2, x, y, this.#radius);
        gradient.addColorStop(0, `rgb(${this.#r}, ${this.#g}, ${this.#b})`);
        gradient.addColorStop(0.1, `rgba(${this.#r}, ${this.#g}, ${this.#b}, 0.4)`);
        gradient.addColorStop(1, "transparent");

        let startAngle = lightAngle - spreadAngle / 2;
        let endAngle = lightAngle + spreadAngle / 2;

        context.fillStyle = gradient;
        context.beginPath()
        ctx.ellipse(x, y, this.#radius, this.#radius, 0, startAngle, endAngle);
        ctx.lineTo(x, y);
        ctx.lineTo(x + this.#radius * Math.cos(startAngle), y + this.#radius * Math.sin(startAngle));
        ctx.lineTo(x + this.#radius * Math.cos(endAngle), y + this.#radius * Math.sin(endAngle));
        context.fill()
    }
}