import { AstroBunny } from "../entities/bunny.js";
export class CurvedLaser {
    angle;
    altitude;
    angularSpeed = 7.5; // Muy veloz a lo largo de la curvatura
    arcLength = 0.14; // Longitud del arco láser en radianes (~60px)
    distanceTraveled = 0;
    maxDistance = 2.2; // Expira tras cruzar el horizonte
    active = true;
    constructor(startAngle, startAltitude) {
        this.angle = startAngle;
        this.altitude = Math.max(12, startAltitude);
    }
    update(dt) {
        const delta = this.angularSpeed * dt;
        this.angle += delta;
        this.distanceTraveled += delta;
        if (this.distanceTraveled >= this.maxDistance) {
            this.active = false;
        }
    }
    render(ctx, planet, worldRotationOffset) {
        if (!this.active)
            return;
        // Ángulo proyectado en pantalla centrado en la posición del jugador
        const visualAngle = AstroBunny.PLAYER_ANCHOR_ANGLE + (this.angle - worldRotationOffset);
        // Descartar si está fuera del cono visible (+/- 75 grados)
        const diff = visualAngle - AstroBunny.PLAYER_ANCHOR_ANGLE;
        if (Math.abs(diff) > 1.3)
            return;
        const r = planet.radius + this.altitude;
        const startArc = visualAngle;
        const endArc = visualAngle + this.arcLength;
        ctx.save();
        // 1. Haz láser cóncavo exterior (resplandor de plasma)
        ctx.strokeStyle = "rgba(0, 255, 255, 0.4)";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(planet.x, planet.y, r, startArc, endArc, false);
        ctx.stroke();
        // 2. Núcleo láser cóncavo hiperbrillante (magenta / blanco neón)
        ctx.strokeStyle = "#ff00bb";
        ctx.lineWidth = 3;
        ctx.shadowColor = "#00ffff";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(planet.x, planet.y, r, startArc, endArc, false);
        ctx.stroke();
        // 3. Punta concentrada del rayo
        const tipX = planet.x + Math.cos(endArc) * r;
        const tipY = planet.y + Math.sin(endArc) * r;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(tipX, tipY, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}
