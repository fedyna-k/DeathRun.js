class Character {
    #x;
    #y;
    #color;
    #name;
    #velocityY;
    #isJumping;
    #gravity = 0.2;
    #lastJumpTime; // Timestamp du dernier saut
    #jumpCooldown = 500;
    #animations; 
    #currentAnimation; 
    #frameIndex = 0; 
    #frameDuration = 5;
    #frameTimer = 0;
    #isGrabbed;

    /**
     * Creates a new character on screen (currently a box).
     * @param {number} x The initial x coordinate.
     * @param {number} y The initial y coordinate.
     */
    constructor(x, y, color, animations, name) {
        this.#x = x;
        this.#y = y;
        this.#color = color;
        this.#name = name;
        this.#velocityY = 0; 
        this.#isJumping = false;
        this.#lastJumpTime = 0;
        this.#animations = animations; 
        this.#currentAnimation = 'idle';
        this.#frameIndex = 4;
        this.#frameDuration = 10;
        this.#frameTimer = 0;
        this.#isGrabbed = false;
    }
    setName(name){
        this.#name = name;
    }
    setColor(color){
        this.#color = color;
    }
    /**
     * Get the character's bounds
     * @returns {{xMin: number, yMin: number, xMax: number, yMax: number}} The bounds
     */
    getBounds() {
        return {
            xMin: this.#x - 10,
            xMax: this.#x + 10,
            yMin: this.#y,
            yMax: this.#y + 50
        };
    }

    /**
     * Get the character's coordinates.
     * @returns {{x: number, y: number}} The coordinates as an Object.
     */
    getCoordinates() {
        return {x: this.#x, y: this.#y};
    }
    
    setIsGrabbed(b){
        this.#isGrabbed = b;
    }

    isGrab(){
        return this.#isGrabbed;
    }


    updateAnimation(state) {
        if (this.#currentAnimation !== state) {
            this.#currentAnimation = state;
            this.#frameIndex = 0; 
            this.#frameTimer = 0; 
        }
    }

    updateState(action) {
        if (this.#currentAnimation !== action) {
            this.#currentAnimation = action;
            this.#frameIndex = 0; // Reset frame index on action change
            this.#frameTimer = 0;
        }
    }
        // Load and initialize animations
        static loadAnimations(colors) {
            const animations = {};
            ['run', 'idle', 'jump','run-left'].forEach(action => {
                animations[action] = [];
               
                for (let i = 1; i <= 4; i++) {
                    colors.forEach(color => {
                        const img = new Image();
                        img.src = `../sprites/${action}${i}.png`;
                        animations[action].push(img);
                    });
                }
            });
            return animations;
        }
        
    /**
     * Draws the character with proper transformations.
    * @param {{object: Ground, args: any}} ground The ground below the character.
    */
    draw(context, ground) {
        let frames = this.#animations[this.#currentAnimation];
        let frame = frames[this.#frameIndex];
        let scale_x = 1;
        let scale_y = 1;
        let rotationAngle;
        if (ground) {
            rotationAngle = ground.object.getRotationAt(this.#x);
        } else {
            rotationAngle = 0;
        }
    
        const centerX = this.#x;
        const centerY = this.#y;
    
        // Calculate drawing coordinates to center sprite in hitbox
        const drawX = centerX - (frame.width * scale_x) / 2;
        const drawY = centerY - (frame.height * scale_y) / 2;
    
        // Begin context state manipulation
        context.save(); // Save the current state of the context
        context.translate(centerX, centerY); // Move to the center of the image
        context.rotate(rotationAngle); // Rotate the canvas
        
        context.fillStyle = this.#color; 
        // Draw the image
        context.drawImage(frame, drawX - centerX, drawY - centerY + 25, frame.width * scale_x, frame.height * scale_y);
        
       
        context.font = '16px Arial';
        context.fillStyle = this.#color; 
        context.textAlign = 'center'; 
        context.fillText(this.#name, 0, -frame.height + 55 ); 
    
        // Restore the context to its original state
        context.restore();
    
        // Update frame timer
        if (++this.#frameTimer >= this.#frameDuration) {
            this.#frameIndex = (this.#frameIndex + 1) % frames.length;
            this.#frameTimer = 0;
        }
    }
    


    drawHitbox(context) {
        let bounds = this.getBounds();
        context.save(); // Save the context state
        context.strokeStyle = "red";
        context.lineWidth = 0;
        const padding = 15;
        // Calcul des nouvelles dimensions avec un 'padding' supplémentaire
        const paddedWidth = (bounds.xMax - bounds.xMin) + padding * 2;
        const paddedHeight = (bounds.yMax - bounds.yMin) + padding;

        // Déplacement du rectangle vers le haut et la gauche de 'padding' pixels
        const newX = bounds.xMin - padding;
        const newY = bounds.yMin - padding;

        context.strokeRect(newX, newY, paddedWidth, paddedHeight);
        context.restore(); // Restore the context state
    }

    /**
     * Update the coordinates, not that fancy for the moment.
     */
    update(ground) {

        

        this.#velocityY += this.#gravity; // Applique la gravité
        this.#velocityY *= 0.99;
        this.#y += this.#velocityY;
        
        let groundY = ground ? ground.object.getPointAt(this.#x, ground.args) : null;

        if (groundY !== null && this.#x >= ground.object.getXBounds().min && this.#x <= ground.object.getXBounds().max && this.#y >= groundY - 50) {
            this.#y = groundY - 50;
            this.#isJumping = false;
            this.#velocityY = 0;
        } else {
        //     // S'il n'est sur aucune plateforme, il devrait "tomber"
            this.#isJumping = true;
        }
    }

    /**
     * Sets the character's coordinates.
     * @param {number} x The new x coordinate.
     * @param {number} y The new y coordinate.
     */
    setPosition(x, y) {
        this.#x = x;
        this.#y = y;
    }

    jump(){
        const currentTime = Date.now();
        if (currentTime - this.#lastJumpTime > this.#jumpCooldown) { 
            this.#isJumping = true; 
            this.#velocityY = -10;
            this.#lastJumpTime = currentTime;
        } else {
            this.update();
        }
    }

    /**
     * Clip the character on the ground below him.
     * @param {{object: Ground, args: any}} ground The ground below the character.
     */
    clip(ground) {

        let bounds = ground.object.getXBounds();
        let groundY = ground.object.getPointAt(this.#x, ground.args);
        
        if (this.#x >= bounds.min && this.#x <= bounds.max && !this.#isJumping) {
            this.#y = groundY - 50;
        } else {
            this.#isJumping = true; // Forcer le personnage à commencer à tomber
        }
    }      
}



