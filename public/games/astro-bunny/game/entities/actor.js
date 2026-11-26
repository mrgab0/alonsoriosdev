import { PolarMath } from "../../core/math.js";
export class Actor {
    planetAngle;
    altitude;
    angularVelocity = 0;
    radialVelocity = 0;
    isGrounded = true;
    facingRight = true;
    baseHeight = 14; // Altura del centro del actor sobre la superficie
    constructor(initialAngle = -Math.PI / 2, initialAltitude = 0) {
        this.planetAngle = initialAngle;
        this.altitude = initialAltitude;
    }
    /**
     * Obtiene la posición cartesiana (x, y) actual en el mundo en base a la curvatura del planeta.
     */
    getPosition(planet) {
        const currentRadius = planet.radius + this.altitude + this.baseHeight;
        return PolarMath.polarToCartesian(planet.x, planet.y, currentRadius, this.planetAngle);
    }
    /**
     * Aplica gravedad radial centrípeta del planeta y resuelve colisión con la superficie.
     */
    applyPlanetaryGravity(dt, planet) {
        const pos = this.getPosition(planet);
        const gravityVec = planet.getGravityAt(pos);
        const gravityMagnitude = Math.sqrt(gravityVec.x * gravityVec.x + gravityVec.y * gravityVec.y);
        if (!this.isGrounded) {
            this.radialVelocity -= gravityMagnitude * dt;
            this.altitude += this.radialVelocity * dt;
            if (this.altitude <= 0) {
                this.altitude = 0;
                this.radialVelocity = 0;
                this.isGrounded = true;
            }
        }
        else {
            // Adhesión férrea a la curvatura planetaria mientras esté en el suelo
            this.altitude = 0;
            this.radialVelocity = 0;
        }
    }
    /**
     * Actualiza el ángulo orbital y lo normaliza en [-PI, PI].
     */
    updateOrbitalAngle(dt) {
        this.planetAngle += this.angularVelocity * dt;
        this.planetAngle = PolarMath.normalizeAngle(this.planetAngle);
    }
}
