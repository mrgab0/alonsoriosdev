import { Vec2, PolarMath } from "../core/math.js";
export class Planet {
    x;
    y;
    radius;
    gravity;
    rotationAngle = 0; // Rotación visual de la superficie
    colorCore;
    colorSurface;
    colorAtmosphere;
    colorVeins;
    textureType;
    // Rasgos geológicos procedurales deterministas
    craters = [];
    veins = [];
    dunes = [];
    constructor(config) {
        this.x = config.x;
        this.y = config.y;
        this.radius = config.radius;
        this.gravity = config.gravity ?? 1600;
        this.colorCore = config.colorCore ?? "#09122c";
        this.colorSurface = config.colorSurface ?? "#162856";
        this.colorAtmosphere = config.colorAtmosphere ?? "rgba(0, 229, 255, 0.4)";
        this.colorVeins = config.colorVeins ?? "#00e5ff";
        this.textureType = config.textureType ?? "neon_circuits";
        this.initProceduralFeatures();
    }
    setRadius(newRadius, crestY = 480) {
        this.radius = newRadius;
        this.y = crestY + newRadius;
        this.initProceduralFeatures();
    }
    initProceduralFeatures() {
        this.craters = [];
        this.veins = [];
        this.dunes = [];
        // 1. Generación determinista de 28 cráteres volumétricos con sombras
        for (let i = 0; i < 28; i++) {
            const baseAngle = (i / 28) * Math.PI * 2;
            const jitter = Math.sin(i * 7.9) * 0.08;
            const size = 6 + Math.abs(Math.cos(i * 11.3)) * 16;
            const depthRadius = this.radius - (10 + Math.abs(Math.sin(i * 4.7)) * 36);
            this.craters.push({
                angle: baseAngle + jitter,
                depthRadius,
                size
            });
        }
        // 2. Generación de 16 venas de bioluminiscencia y circuitos tectónicos
        for (let i = 0; i < 16; i++) {
            const startAngle = (i / 16) * Math.PI * 2 + Math.sin(i * 3.3) * 0.1;
            const length = 0.22 + Math.abs(Math.cos(i * 5.1)) * 0.24;
            const radiusOffset = 14 + (i % 4) * 14;
            this.veins.push({
                startAngle,
                endAngle: startAngle + length,
                radiusOffset,
                branchAngle: startAngle + length * 0.5,
                branchLength: 12 + (i % 3) * 8
            });
        }
        // 3. Generación de 20 líneas de crestas/dunas para mundos desérticos
        for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2 + Math.cos(i * 4.1) * 0.06;
            this.dunes.push({
                angle,
                arcLength: 0.28,
                radiusOffset: 12 + (i % 4) * 12
            });
        }
    }
    rotate(angularDelta) {
        // Al avanzar (angularDelta > 0), el suelo debe rodar hacia atrás (-angularDelta)
        this.rotationAngle -= angularDelta;
        if (this.rotationAngle > Math.PI * 2) {
            this.rotationAngle -= Math.PI * 2;
        }
        else if (this.rotationAngle < 0) {
            this.rotationAngle += Math.PI * 2;
        }
    }
    getGravityAt(pos) {
        const dist = Vec2.distance({ x: this.x, y: this.y }, pos);
        if (dist < 1)
            return { x: 0, y: 0 };
        const normal = PolarMath.radialNormal(this.getAngleAt(pos));
        return {
            x: -normal.x * this.gravity,
            y: -normal.y * this.gravity
        };
    }
    getSurfaceAltitude(pos) {
        return Vec2.distance({ x: this.x, y: this.y }, pos) - this.radius;
    }
    getAngleAt(pos) {
        return Math.atan2(pos.y - this.y, pos.x - this.x);
    }
    getSurfacePoint(angle, altitudeOffset = 0) {
        return PolarMath.polarToCartesian(this.x, this.y, this.radius + altitudeOffset, angle);
    }
    render(ctx) {
        // 1. Resplandor exterior de la atmósfera superior (Media Luna)
        const atmoGrad = ctx.createRadialGradient(this.x, this.y, this.radius * 0.96, this.x, this.y, this.radius * 1.18);
        atmoGrad.addColorStop(0, this.colorAtmosphere);
        atmoGrad.addColorStop(0.4, "rgba(0, 180, 255, 0.12)");
        atmoGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = atmoGrad;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 1.18, 0, Math.PI * 2);
        ctx.fill();
        // 2. Masa planetaria sólida con gradiente radial de núcleo
        const planetGrad = ctx.createRadialGradient(this.x, this.y - this.radius * 0.8, this.radius * 0.1, this.x, this.y, this.radius);
        planetGrad.addColorStop(0, this.colorSurface);
        planetGrad.addColorStop(0.55, this.colorCore);
        planetGrad.addColorStop(1, "#02040d");
        ctx.fillStyle = planetGrad;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        // 3. Rasgos superficiales geológicos rotatorios
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotationAngle);
        // A) Estratos concéntricos de la corteza geológica
        for (let r = this.radius - 75; r < this.radius; r += 20) {
            ctx.strokeStyle = "rgba(255, 255, 255, 0.035)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.stroke();
        }
        // B) Venas de Bioluminiscencia / Circuitos Neón
        if (this.textureType === "neon_circuits" || this.textureType === "ice_crystals") {
            ctx.strokeStyle = this.colorVeins;
            ctx.lineWidth = 1.6;
            ctx.shadowColor = this.colorVeins;
            ctx.shadowBlur = 6;
            for (const v of this.veins) {
                const r = this.radius - v.radiusOffset;
                ctx.beginPath();
                ctx.arc(0, 0, r, v.startAngle, v.endAngle);
                ctx.stroke();
                // Ramificaciones radiales
                const bx = Math.cos(v.branchAngle) * r;
                const by = Math.sin(v.branchAngle) * r;
                const ex = Math.cos(v.branchAngle) * (r - v.branchLength);
                const ey = Math.sin(v.branchAngle) * (r - v.branchLength);
                ctx.beginPath();
                ctx.moveTo(bx, by);
                ctx.lineTo(ex, ey);
                ctx.stroke();
            }
            ctx.shadowBlur = 0;
        }
        else if (this.textureType === "dunes") {
            // Dunas y ondulaciones de cañones marcianos
            ctx.strokeStyle = "rgba(255, 120, 100, 0.2)";
            ctx.lineWidth = 2.2;
            for (const d of this.dunes) {
                const r = this.radius - d.radiusOffset;
                ctx.beginPath();
                ctx.arc(0, 0, r, d.angle, d.angle + d.arcLength);
                ctx.stroke();
            }
        }
        // C) Cráteres de Impacto con Relieve e Iluminación 3D
        for (const c of this.craters) {
            const cx = Math.cos(c.angle) * c.depthRadius;
            const cy = Math.sin(c.angle) * c.depthRadius;
            // 1. Cuenca profunda del cráter (Sombra oscura)
            ctx.fillStyle = "rgba(2, 4, 14, 0.75)";
            ctx.beginPath();
            ctx.arc(cx, cy, c.size, 0, Math.PI * 2);
            ctx.fill();
            // 2. Relieve lumínico estelar en el borde exterior
            ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
            ctx.lineWidth = 1.3;
            ctx.beginPath();
            ctx.arc(cx, cy, c.size, c.angle - Math.PI * 0.5, c.angle + Math.PI * 0.5);
            ctx.stroke();
            // 3. Cono de sombra interna
            ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
            ctx.beginPath();
            ctx.arc(cx + Math.cos(c.angle) * (c.size * 0.25), cy + Math.sin(c.angle) * (c.size * 0.25), c.size * 0.55, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
        // 4. Contorno superior fluorescente de neón (Horizonte de la cresta)
        ctx.strokeStyle = this.colorAtmosphere;
        ctx.lineWidth = 3.5;
        ctx.shadowColor = this.colorVeins;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
    }
}
