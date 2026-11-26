export class ExhaustEmitter {
    static POOL_SIZE = 140;
    pool = [];
    constructor() {
        for (let i = 0; i < ExhaustEmitter.POOL_SIZE; i++) {
            this.pool.push({
                x: 0,
                y: 0,
                vx: 0,
                vy: 0,
                life: 0,
                maxLife: 1,
                size: 2,
                color: "#ffffff",
                active: false
            });
        }
    }
    /**
     * Emite partículas de escape según el nivel actual de propulsor.
     * @param x Posición X de la tobera del cohete en coordenadas mundiales.
     * @param y Posición Y de la tobera del cohete en coordenadas mundiales.
     * @param angle Ángulo de expulsión de los gases.
     * @param tier Nivel del propulsor ('NORMAL', 'COMBUSTION', 'PLASMA', 'WARP').
     */
    emit(x, y, angle, tier) {
        if (tier === "NORMAL")
            return;
        const count = tier === "WARP" ? 5 : (tier === "PLASMA" ? 3 : 2);
        const speed = tier === "WARP" ? 220 : (tier === "PLASMA" ? 150 : 90);
        for (let i = 0; i < count; i++) {
            const p = this.findAvailableParticle();
            if (!p)
                break;
            const spread = (Math.random() - 0.5) * (tier === "WARP" ? 0.35 : 0.6);
            const finalAngle = angle + spread;
            const velocity = speed * (0.8 + Math.random() * 0.4);
            p.active = true;
            p.x = x + (Math.random() - 0.5) * 4;
            p.y = y + (Math.random() - 0.5) * 4;
            p.vx = Math.cos(finalAngle) * velocity;
            p.vy = Math.sin(finalAngle) * velocity;
            p.life = 0;
            p.maxLife = tier === "WARP" ? 0.35 : (tier === "PLASMA" ? 0.28 : 0.22);
            if (tier === "COMBUSTION") {
                const colors = ["#ff3300", "#ff7700", "#ffcc00", "#ffffff"];
                p.color = colors[Math.floor(Math.random() * colors.length)];
                p.size = 3.5 + Math.random() * 3.0;
            }
            else if (tier === "PLASMA") {
                const colors = ["#00f0ff", "#0099ff", "#ff00dd", "#ffffff"];
                p.color = colors[Math.floor(Math.random() * colors.length)];
                p.size = 4.0 + Math.random() * 3.5;
            }
            else {
                // WARP
                const colors = ["#ffffff", "#88eeff", "#00ffff", "#ffffdd"];
                p.color = colors[Math.floor(Math.random() * colors.length)];
                p.size = 5.0 + Math.random() * 4.5;
            }
        }
    }
    findAvailableParticle() {
        for (const p of this.pool) {
            if (!p.active)
                return p;
        }
        return null;
    }
    update(dt) {
        for (const p of this.pool) {
            if (!p.active)
                continue;
            p.life += dt;
            if (p.life >= p.maxLife) {
                p.active = false;
                continue;
            }
            p.x += p.vx * dt;
            p.y += p.vy * dt;
        }
    }
    render(ctx) {
        for (const p of this.pool) {
            if (!p.active)
                continue;
            const progress = p.life / p.maxLife;
            const alpha = 1 - progress;
            const currentSize = p.size * (1 - progress * 0.6);
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, Math.max(0.5, currentSize), 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
}
