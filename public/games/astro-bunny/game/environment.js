import { PolarMath } from "../core/math.js";
import { AstroBunny } from "./entities/bunny.js";
export class EnvironmentSystem {
    weather = "none";
    intensityMultiplier = 1.0;
    stormTime = 0;
    // Viento Solar
    windLines = [];
    windResistance = 0; // Efecto de resistencia actual
    // Nubes Volumétricas y Ráfagas de Tormenta de Smog Verde
    smogPuffs = [];
    // Lluvia de Meteoros
    meteors = [];
    meteorSpawnTimer = 0;
    // Bancos de Polvo Estelar
    stardustPatches = [];
    constructor(weather = "none") {
        this.setWeather(weather);
    }
    setIntensity(multiplier) {
        this.intensityMultiplier = Math.max(0.4, Math.min(2.0, multiplier));
    }
    setWeather(weather) {
        this.weather = weather;
        this.intensityMultiplier = 1.0;
        this.stormTime = 0;
        this.windLines = [];
        this.smogPuffs = [];
        this.meteors = [];
        this.stardustPatches = [];
        if (weather === "solar_wind") {
            for (let i = 0; i < 24; i++) {
                this.windLines.push({
                    angle: Math.random() * Math.PI * 2,
                    altitude: 10 + Math.random() * 50,
                    length: 0.15 + Math.random() * 0.25,
                    speed: 1.8 + Math.random() * 1.4,
                    alpha: 0.2 + Math.random() * 0.4
                });
            }
        }
        else if (weather === "green_smog") {
            // Motor de Tormenta de Arena Tóxica Multicapa (Alejado a altitud >= 82px)
            // 1. Billows: 16 masas volumétricas grandes y turbulentas
            for (let i = 0; i < 16; i++) {
                this.smogPuffs.push({
                    type: "billow",
                    x: -50 + Math.random() * 460,
                    altitude: 84 + Math.random() * 48, // 84px a 132px: lejos del alcance de saltos estándar
                    radius: 46 + Math.random() * 34, // Radio masivo de 46 a 80px
                    width: 0,
                    height: 0,
                    speed: 65 + Math.random() * 45, // Deriva media (px/s)
                    alpha: 0.32 + Math.random() * 0.26,
                    wobbleSpeed: 1.4 + Math.random() * 1.8,
                    phase: Math.random() * Math.PI * 2
                });
            }
            // 2. Streamers: 12 cintas de viento y ráfagas aplanadas de alta velocidad
            for (let i = 0; i < 12; i++) {
                this.smogPuffs.push({
                    type: "streamer",
                    x: -60 + Math.random() * 480,
                    altitude: 82 + Math.random() * 40, // 82px a 122px
                    radius: 0,
                    width: 65 + Math.random() * 65, // 65px a 130px de elongación horizontal
                    height: 12 + Math.random() * 10, // 12px a 22px de espesor vertical
                    speed: 140 + Math.random() * 75, // Ráfagas rápidas (140 a 215 px/s)
                    alpha: 0.28 + Math.random() * 0.24,
                    wobbleSpeed: 2.2 + Math.random() * 2.0,
                    phase: Math.random() * Math.PI * 2
                });
            }
            // 3. Spores: 24 micro-areniscas y esporas veloces zumbantes
            for (let i = 0; i < 24; i++) {
                this.smogPuffs.push({
                    type: "spore",
                    x: -40 + Math.random() * 440,
                    altitude: 80 + Math.random() * 56, // 80px a 136px
                    radius: 1.5 + Math.random() * 2.2, // 1.5 a 3.7px
                    width: 6 + Math.random() * 8, // Cola de velocidad
                    height: 0,
                    speed: 180 + Math.random() * 90, // Proyectiles veloces (180 a 270 px/s)
                    alpha: 0.45 + Math.random() * 0.40,
                    wobbleSpeed: 3.5 + Math.random() * 3.0,
                    phase: Math.random() * Math.PI * 2
                });
            }
        }
        else if (weather === "stardust_haze") {
            // 4 bancos densos distribuidos en la órbita
            for (let i = 0; i < 4; i++) {
                this.stardustPatches.push({
                    angle: (i / 4) * Math.PI * 2 + Math.random() * 0.5,
                    width: 0.4 + Math.random() * 0.25,
                    color: i % 2 === 0 ? "rgba(168, 85, 247, 0.25)" : "rgba(59, 130, 246, 0.25)"
                });
            }
        }
    }
    update(dt, bunny, worldAngle, planet) {
        let dragSlowdown = 0;
        let hitHazard = false;
        // 1. VIENTO SOLAR
        if (this.weather === "solar_wind") {
            for (const line of this.windLines) {
                line.angle -= line.speed * dt;
                if (line.angle < 0)
                    line.angle += Math.PI * 2;
            }
            // Si el conejo no está en slide y no está en Warp, sufre resistencia aerodinámica
            if (bunny.currentTier !== "WARP") {
                if (bunny.isSliding) {
                    dragSlowdown = 0.04 * this.intensityMultiplier; // Deslizándose corta el viento con mínima fricción
                }
                else {
                    dragSlowdown = 0.18 * this.intensityMultiplier; // Erguido sufre freno frontal
                }
            }
        }
        // 2. LLUVIA DE METEORITOS
        if (this.weather === "meteor_rain") {
            this.meteorSpawnTimer -= dt;
            if (this.meteorSpawnTimer <= 0) {
                this.meteorSpawnTimer = (0.25 + Math.random() * 0.35) / this.intensityMultiplier;
                this.meteors.push({
                    x: 40 + Math.random() * 320,
                    y: -20,
                    vx: -(60 + Math.random() * 70),
                    vy: 140 + Math.random() * 90,
                    size: 3 + Math.random() * 3,
                    life: 1.8,
                    maxLife: 1.8
                });
            }
            // Posición física real de Astro Bunny en pantalla (considerando el desplazamiento a la izquierda)
            const bunnyPos = planet
                ? bunny.getPosition(planet)
                : { x: 136.35, y: 480 - bunny.altitude };
            for (let i = this.meteors.length - 1; i >= 0; i--) {
                const m = this.meteors[i];
                m.x += m.vx * dt;
                m.y += m.vy * dt;
                m.life -= dt;
                // Comprobar colisión con la posición real visible de Astro Bunny
                const distToBunny = Math.hypot(m.x - bunnyPos.x, m.y - bunnyPos.y);
                if (distToBunny < 18 + m.size && bunny.invulnerableTimer <= 0 && bunny.currentTier !== "WARP") {
                    // Si el conejo se desliza, los meteoros altos no lo golpean
                    if (!(bunny.isSliding && m.y < bunnyPos.y - 10)) {
                        hitHazard = true;
                        m.life = 0;
                    }
                }
                if (m.life <= 0 || m.y > 640) {
                    this.meteors.splice(i, 1);
                }
            }
        }
        // 3. POLVO ESTELAR / NEBLINAS VISCOSAS
        if (this.weather === "stardust_haze" && bunny.currentTier !== "WARP" && bunny.altitude < 14) {
            for (const patch of this.stardustPatches) {
                const diff = Math.abs(PolarMath.normalizeAngle(patch.angle - worldAngle));
                if (diff < patch.width / 2) {
                    dragSlowdown = Math.max(dragSlowdown, 0.22 * this.intensityMultiplier); // Freno por polvo denso en el suelo
                }
            }
        }
        // 4. TORMENTA DE ARENA TÓXICA (SMOG VERDE ELEVADO A ALTITUD >= 80px)
        if (this.weather === "green_smog") {
            this.stormTime += dt;
            for (const puff of this.smogPuffs) {
                puff.x -= puff.speed * dt * this.intensityMultiplier;
                puff.phase += puff.wobbleSpeed * dt;
                // Reciclaje horizontal continuo en pantalla fuera del margen izquierdo
                if (puff.x < -100) {
                    if (puff.type === "billow") {
                        puff.x = 420 + Math.random() * 40;
                        puff.altitude = 84 + Math.random() * 48;
                        puff.radius = 46 + Math.random() * 34;
                        puff.alpha = 0.32 + Math.random() * 0.26;
                    }
                    else if (puff.type === "streamer") {
                        puff.x = 440 + Math.random() * 60;
                        puff.altitude = 82 + Math.random() * 40;
                        puff.width = 65 + Math.random() * 65;
                        puff.height = 12 + Math.random() * 10;
                        puff.alpha = 0.28 + Math.random() * 0.24;
                    }
                    else {
                        // spore
                        puff.x = 410 + Math.random() * 30;
                        puff.altitude = 80 + Math.random() * 56;
                        puff.radius = 1.5 + Math.random() * 2.2;
                        puff.alpha = 0.45 + Math.random() * 0.40;
                    }
                }
            }
            // Si el conejo salta hacia la troposfera alta (altitud >= 80px), penetra en la tormenta de smog
            if (bunny.currentTier !== "WARP") {
                if (bunny.altitude >= 80) {
                    dragSlowdown = 0.32 * this.intensityMultiplier; // Fuerte resistencia aerodinámica en el ápice tóxico
                    if (bunny.isHanging) {
                        dragSlowdown *= 1.45; // Penalización severa por flotar alto con Hang-Time
                    }
                }
                else {
                    dragSlowdown = 0; // Aire limpio a ras de suelo y saltos normales (0 a 79px): 100% tracción sin freno
                }
            }
        }
        this.windResistance = dragSlowdown;
        return { hitHazard, dragSlowdown };
    }
    render(ctx, planet, worldAngle) {
        // A) Renderizar Viento Solar
        if (this.weather === "solar_wind") {
            ctx.save();
            for (const line of this.windLines) {
                const diff = PolarMath.normalizeAngle(line.angle - worldAngle);
                if (Math.abs(diff) > 1.4)
                    continue;
                const visualAngle = AstroBunny.PLAYER_ANCHOR_ANGLE + diff;
                const start = PolarMath.polarToCartesian(planet.x, planet.y, planet.radius + line.altitude, visualAngle);
                const end = PolarMath.polarToCartesian(planet.x, planet.y, planet.radius + line.altitude, visualAngle + line.length);
                ctx.strokeStyle = `rgba(56, 189, 248, ${line.alpha})`;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(start.x, start.y);
                ctx.lineTo(end.x, end.y);
                ctx.stroke();
            }
            ctx.restore();
        }
        // B) Renderizar Bancos de Polvo Estelar
        if (this.weather === "stardust_haze") {
            ctx.save();
            for (const patch of this.stardustPatches) {
                const diff = PolarMath.normalizeAngle(patch.angle - worldAngle);
                if (Math.abs(diff) > 1.2)
                    continue;
                const visualAngle = AstroBunny.PLAYER_ANCHOR_ANGLE + diff;
                const pos = PolarMath.polarToCartesian(planet.x, planet.y, planet.radius + 16, visualAngle);
                const grad = ctx.createRadialGradient(pos.x, pos.y, 4, pos.x, pos.y, 44);
                grad.addColorStop(0, patch.color);
                grad.addColorStop(1, "rgba(0, 0, 0, 0)");
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, 44, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }
        // C) Renderizar Lluvia de Meteoros
        if (this.weather === "meteor_rain") {
            ctx.save();
            for (const m of this.meteors) {
                const alpha = Math.min(1, m.life / 0.5);
                ctx.strokeStyle = `rgba(251, 146, 60, ${alpha * 0.7})`;
                ctx.lineWidth = m.size * 0.8;
                ctx.beginPath();
                ctx.moveTo(m.x, m.y);
                ctx.lineTo(m.x - m.vx * 0.08, m.y - m.vy * 0.08); // Cola del meteoro
                ctx.stroke();
                ctx.fillStyle = `rgba(254, 215, 170, ${alpha})`;
                ctx.beginPath();
                ctx.arc(m.x, m.y, m.size / 2, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }
        // D) Renderizar Tormenta de Arena Tóxica (Smog Verde Heterogéneo y Dinámico)
        if (this.weather === "green_smog") {
            ctx.save();
            // 1. Velo de tormenta en la estratosfera (altitud 76px a 160px: alejado del suelo)
            const hazeRadius = planet.radius + 105;
            const hazeGrad = ctx.createRadialGradient(planet.x, planet.y, planet.radius + 76, planet.x, planet.y, hazeRadius + 55);
            hazeGrad.addColorStop(0, "rgba(163, 230, 53, 0)"); // Frontera limpia a 76px
            hazeGrad.addColorStop(0.30, "rgba(132, 204, 22, 0.18)"); // Ráfagas de polvo cáustico
            hazeGrad.addColorStop(0.65, "rgba(34, 197, 94, 0.20)"); // Troposfera densa esmeralda
            hazeGrad.addColorStop(0.90, "rgba(6, 78, 59, 0.12)"); // Sombras de tormenta
            hazeGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
            ctx.fillStyle = hazeGrad;
            ctx.beginPath();
            ctx.arc(planet.x, planet.y, hazeRadius + 55, AstroBunny.PLAYER_ANCHOR_ANGLE - 0.65, AstroBunny.PLAYER_ANCHOR_ANGLE + 0.70);
            ctx.arc(planet.x, planet.y, planet.radius + 76, AstroBunny.PLAYER_ANCHOR_ANGLE + 0.70, AstroBunny.PLAYER_ANCHOR_ANGLE - 0.65, true);
            ctx.closePath();
            ctx.fill();
            // 2. Elementos dinámicos heterogéneos de la tormenta (Streamers, Billows y Micro-areniscas)
            for (const puff of this.smogPuffs) {
                const dx = puff.x - planet.x;
                // Modulación de ráfaga y turbulencia dual
                const wobble = Math.sin(puff.phase) * 5 + Math.cos(puff.phase * 1.7) * 3;
                const currentAlt = puff.altitude + wobble;
                const rCloud = planet.radius + currentAlt;
                const dySq = rCloud * rCloud - dx * dx;
                if (dySq <= 0)
                    continue;
                const posY = planet.y - Math.sqrt(dySq);
                const posX = puff.x;
                const gust = Math.sin(this.stormTime * 1.4 + posX * 0.007) * 0.35 + 0.95;
                const finalAlpha = Math.max(0.08, Math.min(0.85, puff.alpha * gust));
                // TIPO A: CINTAS DE VIENTO / STREAMERS HORIZONTALES (Ráfagas veloces)
                if (puff.type === "streamer") {
                    ctx.save();
                    ctx.translate(posX, posY);
                    // Ligera inclinación aerodinámica
                    ctx.rotate(-0.06);
                    const streamGrad = ctx.createLinearGradient(-puff.width / 2, 0, puff.width / 2, 0);
                    streamGrad.addColorStop(0, "rgba(163, 230, 53, 0)");
                    streamGrad.addColorStop(0.45, `rgba(132, 204, 22, ${finalAlpha * 0.9})`);
                    streamGrad.addColorStop(0.85, `rgba(34, 197, 94, ${finalAlpha * 0.5})`);
                    streamGrad.addColorStop(1, "rgba(20, 83, 45, 0)");
                    ctx.fillStyle = streamGrad;
                    ctx.beginPath();
                    ctx.ellipse(0, 0, puff.width / 2, puff.height / 2, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
                // TIPO B: VOLUTAS VOLUMÉTRICAS GRANDES (Billows ondulantes)
                else if (puff.type === "billow") {
                    const grad = ctx.createRadialGradient(posX, posY, 4, posX, posY, puff.radius);
                    grad.addColorStop(0, `rgba(163, 230, 53, ${finalAlpha * 0.90})`);
                    grad.addColorStop(0.35, `rgba(74, 222, 128, ${finalAlpha * 0.65})`);
                    grad.addColorStop(0.75, `rgba(20, 83, 45, ${finalAlpha * 0.28})`);
                    grad.addColorStop(1, "rgba(5, 46, 22, 0)");
                    ctx.fillStyle = grad;
                    ctx.beginPath();
                    ctx.arc(posX, posY, puff.radius, 0, Math.PI * 2);
                    ctx.fill();
                }
                // TIPO C: MICRO-ARENISCA Y ESPORAS ZUMBANTES (Proyectiles de arena veloz)
                else {
                    // Cola aerodinámica de la arenisca
                    ctx.strokeStyle = `rgba(190, 242, 100, ${finalAlpha * 0.75})`;
                    ctx.lineWidth = puff.radius;
                    ctx.beginPath();
                    ctx.moveTo(posX, posY);
                    ctx.lineTo(posX + puff.width, posY);
                    ctx.stroke();
                    // Grano incandescente de polvo cósmico
                    ctx.fillStyle = `rgba(250, 204, 21, ${finalAlpha * 1.1})`;
                    ctx.beginPath();
                    ctx.arc(posX, posY, puff.radius * 0.75, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            ctx.restore();
        }
    }
}
