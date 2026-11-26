import { PolarMath } from "../../core/math.js";
import { AstroBunny } from "./bunny.js";
export class Enemy {
    id;
    angle;
    altitude = 0;
    active = true;
    constructor(id, angle) {
        this.id = id;
        this.angle = angle;
    }
}
export class SpaceCoyote extends Enemy {
    type = "coyote";
    size = 24;
    animTimer = 0;
    patrolSpeed = -0.32; // Patrulla en sentido contrario
    constructor(id, angle) {
        super(id, angle);
        this.altitude = 0;
    }
    update(dt) {
        this.angle += this.patrolSpeed * dt;
        this.animTimer += Math.abs(this.patrolSpeed) * 16 * dt;
    }
    getHitBox(planet) {
        const pos = PolarMath.polarToCartesian(planet.x, planet.y, planet.radius + 12, this.angle);
        return { pos, radius: 14 };
    }
    render(ctx, planet, worldOffset) {
        if (!this.active)
            return;
        const visualAngle = AstroBunny.PLAYER_ANCHOR_ANGLE + (this.angle - worldOffset);
        if (Math.abs(visualAngle - AstroBunny.PLAYER_ANCHOR_ANGLE) > 1.3)
            return;
        const pos = PolarMath.polarToCartesian(planet.x, planet.y, planet.radius + 12, visualAngle);
        ctx.save();
        ctx.translate(pos.x, pos.y);
        ctx.rotate(visualAngle + Math.PI / 2);
        ctx.scale(-1, 1); // Mira hacia la izquierda (contra el conejo)
        // Mochila cohete
        ctx.fillStyle = "#475569";
        ctx.fillRect(-8, -4, 4, 10);
        ctx.fillStyle = "#ff4400";
        ctx.fillRect(-7, 6, 2, 2);
        // Cuerpo de coyote marrón rojizo
        ctx.fillStyle = "#c2410c";
        ctx.beginPath();
        ctx.ellipse(0, 0, 8, 11, 0, 0, Math.PI * 2);
        ctx.fill();
        // Piernas animadas
        const leg = Math.sin(this.animTimer) * 4;
        ctx.fillStyle = "#9a3412";
        ctx.fillRect(-3, 8 + leg, 2.5, 5);
        ctx.fillRect(2, 8 - leg, 2.5, 5);
        // Cabeza con hocico alargado
        ctx.fillStyle = "#ea580c";
        ctx.beginPath();
        ctx.arc(3, -7, 6, 0, Math.PI * 2);
        ctx.fill();
        // Hocico
        ctx.fillStyle = "#fed7aa";
        ctx.beginPath();
        ctx.moveTo(5, -6);
        ctx.lineTo(12, -4);
        ctx.lineTo(5, -3);
        ctx.closePath();
        ctx.fill();
        // Orejas puntiagudas de coyote
        ctx.fillStyle = "#9a3412";
        ctx.beginPath();
        ctx.moveTo(-1, -12);
        ctx.lineTo(2, -18);
        ctx.lineTo(4, -12);
        ctx.closePath();
        ctx.fill();
        // Gafas espaciales de aviador
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(1, -9, 7, 3.5);
        ctx.fillStyle = "#38bdf8";
        ctx.fillRect(4, -8.5, 3, 2);
        ctx.restore();
    }
}
export class CosmicRattlesnake extends Enemy {
    type = "snake";
    size = 26;
    animTimer = 0;
    constructor(id, angle) {
        super(id, angle);
        this.altitude = 0;
    }
    update(dt) {
        // Repta lentamente hacia adelante
        this.angle -= 0.18 * dt;
        this.animTimer += 10 * dt;
    }
    getHitBox(planet) {
        const pos = PolarMath.polarToCartesian(planet.x, planet.y, planet.radius + 6, this.angle);
        return { pos, radius: 12 };
    }
    render(ctx, planet, worldOffset) {
        if (!this.active)
            return;
        const visualAngle = AstroBunny.PLAYER_ANCHOR_ANGLE + (this.angle - worldOffset);
        if (Math.abs(visualAngle - AstroBunny.PLAYER_ANCHOR_ANGLE) > 1.3)
            return;
        const pos = PolarMath.polarToCartesian(planet.x, planet.y, planet.radius + 6, visualAngle);
        ctx.save();
        ctx.translate(pos.x, pos.y);
        ctx.rotate(visualAngle + Math.PI / 2);
        ctx.scale(-1, 1);
        // Segmentos ondulantes de la serpiente
        const segmentCount = 6;
        for (let i = 0; i < segmentCount; i++) {
            const segX = (i - 2.5) * 5;
            const segY = Math.sin(this.animTimer + i * 0.8) * 3;
            const radius = i === segmentCount - 1 ? 5 : (i === 0 ? 3 : 4);
            ctx.fillStyle = i === segmentCount - 1 ? "#10b981" : "#047857";
            ctx.beginPath();
            ctx.arc(segX, segY, radius, 0, Math.PI * 2);
            ctx.fill();
            // Patrón de escamas neón
            ctx.fillStyle = "#6ee7b7";
            ctx.beginPath();
            ctx.arc(segX, segY, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }
        // Cascabel vibrante al final de la cola (índice 0)
        const tailY = Math.sin(this.animTimer) * 3;
        const rattleBlink = Math.sin(this.animTimer * 2) > 0;
        ctx.fillStyle = rattleBlink ? "#facc15" : "#eab308";
        ctx.beginPath();
        ctx.arc(-15, tailY, 3, 0, Math.PI * 2);
        ctx.fill();
        // Ojos rojos de la cabeza (índice segmentCount - 1)
        const headX = (segmentCount - 1 - 2.5) * 5;
        const headY = Math.sin(this.animTimer + (segmentCount - 1) * 0.8) * 3;
        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.arc(headX + 2, headY - 1.5, 1.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}
