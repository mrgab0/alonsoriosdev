export class DeepSpaceBackground {
    nebulae = [];
    miniPlanets = [];
    stars = [];
    time = 0;
    constructor() {
        this.initCosmos();
    }
    initCosmos() {
        // 1. Nubes de Supernova y Nebulosas cósmicas
        this.nebulae = [
            {
                x: 80,
                y: 160,
                radius: 170,
                colorInner: "rgba(255, 0, 119, 0.22)", // Magenta Supernova
                colorOuter: "rgba(0, 0, 0, 0)"
            },
            {
                x: 280,
                y: 380,
                radius: 190,
                colorInner: "rgba(0, 229, 255, 0.20)", // Cian Cósmico
                colorOuter: "rgba(0, 0, 0, 0)"
            },
            {
                x: 180,
                y: 520,
                radius: 180,
                colorInner: "rgba(124, 58, 237, 0.25)", // Violeta Pulsar
                colorOuter: "rgba(0, 0, 0, 0)"
            },
            {
                x: 290,
                y: 120,
                radius: 130,
                colorInner: "rgba(251, 191, 36, 0.15)", // Polvo Dorado Estelar
                colorOuter: "rgba(0, 0, 0, 0)"
            }
        ];
        // 2. Miniaturas flotantes de todos los mundos del juego
        this.miniPlanets = [
            {
                name: "Neo-Cosmos",
                baseX: 65,
                baseY: 260,
                radius: 24,
                colorSurface: "#162856",
                colorAtmosphere: "rgba(0, 229, 255, 0.45)",
                colorRing: "rgba(0, 229, 255, 0.6)",
                orbitSpeed: 0.35,
                orbitPhase: 0,
                driftRadius: 14
            },
            {
                name: "Cañón Neón",
                baseX: 285,
                baseY: 230,
                radius: 20,
                colorSurface: "#0c3b6d",
                colorAtmosphere: "rgba(14, 165, 233, 0.5)",
                orbitSpeed: 0.45,
                orbitPhase: 1.8,
                driftRadius: 16
            },
            {
                name: "Dunas Rojas",
                baseX: 85,
                baseY: 530,
                radius: 22,
                colorSurface: "#881337",
                colorAtmosphere: "rgba(244, 63, 94, 0.45)",
                colorRing: "rgba(251, 146, 60, 0.5)",
                orbitSpeed: 0.28,
                orbitPhase: 3.4,
                driftRadius: 18
            },
            {
                name: "Ciber-Hielo",
                baseX: 275,
                baseY: 520,
                radius: 18,
                colorSurface: "#0284c7",
                colorAtmosphere: "rgba(125, 211, 252, 0.5)",
                orbitSpeed: 0.5,
                orbitPhase: 4.8,
                driftRadius: 12
            }
        ];
        // 3. Estrellas titilantes
        for (let i = 0; i < 70; i++) {
            this.stars.push({
                x: Math.random() * 360,
                y: Math.random() * 640,
                size: Math.random() < 0.25 ? 2.2 : (Math.random() < 0.6 ? 1.5 : 0.9),
                phase: Math.random() * Math.PI * 2,
                speed: 1.5 + Math.random() * 2.5,
                color: Math.random() < 0.2 ? "#38bdf8" : (Math.random() < 0.35 ? "#f472b6" : "#ffffff")
            });
        }
    }
    update(dt) {
        this.time += dt;
    }
    render(ctx, width, height) {
        ctx.save();
        // 1. Fondo base de Espacio Profundo
        ctx.fillStyle = "#010208";
        ctx.fillRect(0, 0, width, height);
        // 2. Nubes de Supernova y Nebulosas difusas
        for (const neb of this.nebulae) {
            const pulse = Math.sin(this.time * 0.4 + neb.x) * 12;
            const r = Math.max(10, neb.radius + pulse);
            const grad = ctx.createRadialGradient(neb.x, neb.y, 0, neb.x, neb.y, r);
            grad.addColorStop(0, neb.colorInner);
            grad.addColorStop(1, neb.colorOuter);
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(neb.x, neb.y, r, 0, Math.PI * 2);
            ctx.fill();
        }
        // 3. Estrellas titilantes
        for (const s of this.stars) {
            const alpha = Math.sin(this.time * s.speed + s.phase) * 0.4 + 0.6;
            ctx.fillStyle = s.color;
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1.0;
        // 4. Rayo cósmico ocasional (Shooting Star)
        const shootCycle = (this.time * 0.3) % 8.0;
        if (shootCycle < 0.8) {
            const progress = shootCycle / 0.8;
            const startX = 320 - progress * 240;
            const startY = 80 + progress * 160;
            const len = 35 * Math.sin(progress * Math.PI);
            ctx.strokeStyle = "rgba(0, 229, 255, 0.75)";
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(startX - len, startY + len * 0.6);
            ctx.stroke();
        }
        // 5. Miniaturas flotantes de los planetas orbitando en el cosmos
        for (const p of this.miniPlanets) {
            const currentAngle = this.time * p.orbitSpeed + p.orbitPhase;
            const currentX = p.baseX + Math.cos(currentAngle) * p.driftRadius;
            const currentY = p.baseY + Math.sin(currentAngle * 1.2) * (p.driftRadius * 0.7);
            // A) Resplandor atmosférico de la miniatura
            const atmoGrad = ctx.createRadialGradient(currentX, currentY, p.radius * 0.8, currentX, currentY, p.radius * 1.6);
            atmoGrad.addColorStop(0, p.colorAtmosphere);
            atmoGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
            ctx.fillStyle = atmoGrad;
            ctx.beginPath();
            ctx.arc(currentX, currentY, p.radius * 1.6, 0, Math.PI * 2);
            ctx.fill();
            // B) Cuerpo del mini-planeta
            const planetGrad = ctx.createRadialGradient(currentX - p.radius * 0.35, currentY - p.radius * 0.35, p.radius * 0.1, currentX, currentY, p.radius);
            planetGrad.addColorStop(0, p.colorSurface);
            planetGrad.addColorStop(0.7, "#030612");
            planetGrad.addColorStop(1, "#000000");
            ctx.fillStyle = planetGrad;
            ctx.beginPath();
            ctx.arc(currentX, currentY, p.radius, 0, Math.PI * 2);
            ctx.fill();
            // C) Borde reflectante lumínico
            ctx.strokeStyle = p.colorAtmosphere;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(currentX, currentY, p.radius, -Math.PI * 0.7, Math.PI * 0.2);
            ctx.stroke();
            // D) Mini Anillo Cósmico (si aplica)
            if (p.colorRing) {
                ctx.save();
                ctx.translate(currentX, currentY);
                ctx.rotate(-0.4);
                ctx.strokeStyle = p.colorRing;
                ctx.lineWidth = 1.4;
                ctx.beginPath();
                ctx.ellipse(0, 0, p.radius * 1.7, p.radius * 0.5, 0, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }
        }
        ctx.restore();
    }
}
