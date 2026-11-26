import { PolarMath } from "../core/math.js";
import { SpaceCoyote, CosmicRattlesnake } from "./entities/enemies.js";
import { AstroBunny } from "./entities/bunny.js";
export class ObstacleSpawner {
    nextId = 1;
    entities = [];
    enemies = [];
    accumulatedAngle = 0;
    lap = 1;
    lastSpawnAngle = 0;
    enemyType;
    enemyFrequency;
    scarcityMode = false;
    levelCode;
    targetDistance;
    // Nave Nodriza estilo Contra Alien Wars
    mothershipTimer = 3.5;
    mothershipActive = false;
    mothershipX = -60;
    mothershipY = 85;
    constructor(config) {
        this.enemyType = config?.enemyType ?? "coyote";
        this.enemyFrequency = config?.enemyFrequency ?? 1.0;
        this.scarcityMode = config?.scarcityMode ?? false;
        this.levelCode = config?.levelCode ?? "1-1";
        this.targetDistance = config?.targetDistance ?? 0;
        if (this.levelCode === "1-1") {
            this.buildLevel1Track();
        }
        else {
            this.initFirstTrackSegment();
        }
    }
    /**
     * Trazado Maestro de Distancias Calculadas para el Nivel 1 (Fogueo Orbital - 2 Vueltas)
     * Separación mínima calculada de 0.65 a 0.80 rad (>= 1.1s de recuperación en tierra tras cada salto)
     */
    buildLevel1Track() {
        // VUELTA 1: FOGUEO Y APRENDIZAJE RÍTMICO (0 a 2π rad)
        this.spawnCluster(0.45, "carrot_arc");
        this.spawnCluster(1.10, "crater_with_carrots");
        this.spawnCluster(1.75, "boost_pad");
        this.spawnCluster(2.40, "weapon_pod");
        this.spawnCluster(3.05, "low_beam");
        this.spawnCluster(3.75, "carrot_arc");
        this.spawnCluster(4.50, "coyote");
        this.spawnCluster(5.30, "crater_with_carrots");
        this.spawnCluster(6.00, "boost_pad");
        // VUELTA 2: DESAFÍO RÍTMICO Y CLÍMAX (2π a 4π rad)
        this.spawnCluster(6.75, "carrot_arc");
        this.spawnCluster(7.45, "spikes_with_carrots");
        this.spawnCluster(8.20, "low_beam");
        this.spawnCluster(8.95, "weapon_pod");
        this.spawnCluster(9.70, "coyote");
        this.spawnCluster(10.45, "crater_with_carrots");
        this.spawnCluster(11.15, "spikes");
        this.spawnCluster(11.80, "boost_pad");
        // 12.10 a 12.566 rad: Zona Libre de Viento a Favor (Tailwind Zone) para el Mega Salto
        this.lastSpawnAngle = 13.5; // Bloquea generación procedural aleatoria durante el Nivel 1
    }
    initFirstTrackSegment() {
        this.spawnCluster(0.35, "carrot_arc");
        this.spawnCluster(0.85, "boost_pad");
        this.spawnCluster(1.3, "coyote");
        this.spawnCluster(1.8, "weapon_pod");
        this.spawnCluster(2.4, "crater_with_carrots");
        this.lastSpawnAngle = 2.8;
    }
    update(angularProgressDelta, dt) {
        this.accumulatedAngle += angularProgressDelta;
        this.lap = Math.floor(this.accumulatedAngle / (Math.PI * 2)) + 1;
        // 1. Control de la Nave Nodriza
        this.updateMothership(dt);
        // 2. Generación procedimental continua por delante del horizonte (para otros niveles)
        if (this.levelCode !== "1-1") {
            const horizonAhead = this.accumulatedAngle + 1.8;
            while (this.lastSpawnAngle < horizonAhead) {
                const step = 0.54 + Math.random() * 0.22;
                const nextAngle = this.lastSpawnAngle + step;
                // Protección de la Zona de Viento a Favor (Tailwind Zone) en la Meta:
                // En los últimos 0.45 rad (~350px) antes del Warp Gate, PROHIBIDO generar obstáculos peligrosos.
                if (this.targetDistance > 0 && nextAngle >= this.targetDistance - 0.45) {
                    if (nextAngle < this.targetDistance - 0.08) {
                        // Solo arcos de zanahorias y propulsores festivos hacia el Warp Gate
                        this.spawnCluster(nextAngle, "carrot_arc");
                        this.lastSpawnAngle = nextAngle + 0.45;
                    }
                    else {
                        // Superada la meta, detener la generación de obstáculos
                        this.lastSpawnAngle = horizonAhead + 10.0;
                        break;
                    }
                    continue;
                }
                this.lastSpawnAngle = nextAngle;
                this.generateProceduralWave(nextAngle);
            }
        }
        // 3. Actualizar villanos (Coyotes y Víboras)
        for (const enemy of this.enemies) {
            if (enemy.active) {
                enemy.update(dt);
            }
        }
        // 4. Limpieza de entidades y enemigos fuera del horizonte izquierdo (-1.8 rad)
        const cleanupThreshold = this.accumulatedAngle - 1.8;
        this.entities = this.entities.filter((e) => e.angle >= cleanupThreshold && !e.collected);
        this.enemies = this.enemies.filter((e) => e.angle >= cleanupThreshold && e.active);
    }
    updateMothership(dt) {
        if (!this.mothershipActive) {
            this.mothershipTimer -= dt;
            if (this.mothershipTimer <= 0) {
                this.mothershipActive = true;
                this.mothershipX = -60;
                this.mothershipTimer = this.scarcityMode ? 35.0 : (this.enemyFrequency > 1.5 ? 12.0 : 20.0);
            }
        }
        else {
            this.mothershipX += 130 * dt;
            // Al cruzar el centro (X = 180), suelta la cápsula [L]
            if (this.mothershipX >= 180 && this.mothershipX - 130 * dt < 180) {
                // La cápsula cae por delante del conejo a altura accesible corriendo (alt=16)
                this.entities.push({
                    id: this.nextId++,
                    angle: this.accumulatedAngle + 0.65,
                    type: "weapon_pod",
                    altitude: 16,
                    size: 24,
                    collected: false
                });
            }
            if (this.mothershipX > 420) {
                this.mothershipActive = false;
            }
        }
    }
    isInFinishZone(angle) {
        return this.targetDistance > 0 && angle >= this.targetDistance - 0.45;
    }
    generateProceduralWave(atAngle) {
        const roll = Math.random();
        // Modo Hardcore Extremo / Casi Imposible (Niveles 17, 18, 19: enemyFrequency >= 2.0)
        if (this.enemyFrequency >= 2.0) {
            if (roll < 0.28) {
                // Patrulla doble escalonada de coyotes con espaciado seguro (+0.38 rad)
                this.spawnCluster(atAngle, "coyote");
                if (!this.isInFinishZone(atAngle + 0.38)) {
                    this.spawnCluster(atAngle + 0.38, "coyote");
                    this.lastSpawnAngle = Math.max(this.lastSpawnAngle, atAngle + 0.38);
                }
            }
            else if (roll < 0.52) {
                // Combo técnico: Slide Dash bajo viga baja seguido de Púas con espacio de salto (+0.48 rad)
                this.spawnCluster(atAngle, "low_beam");
                if (!this.isInFinishZone(atAngle + 0.48)) {
                    this.spawnCluster(atAngle + 0.48, "spikes");
                    this.lastSpawnAngle = Math.max(this.lastSpawnAngle, atAngle + 0.48);
                }
            }
            else if (roll < 0.70) {
                this.spawnCluster(atAngle, "crater_with_carrots");
            }
            else if (roll < 0.85) {
                this.spawnCluster(atAngle, "low_beam");
            }
            else {
                this.spawnCluster(atAngle, "boost_pad");
            }
            return;
        }
        // Modo Emboscada / Frecuencia Alta (Nivel 1-2 a 1-16)
        if (this.enemyFrequency > 1.4) {
            if (roll < 0.30) {
                // Patrulla doble de coyotes con espaciado seguro (+0.38 rad)
                this.spawnCluster(atAngle, "coyote");
                if (!this.isInFinishZone(atAngle + 0.38)) {
                    this.spawnCluster(atAngle + 0.38, "coyote");
                    this.lastSpawnAngle = Math.max(this.lastSpawnAngle, atAngle + 0.38);
                }
            }
            else if (roll < 0.52) {
                this.spawnCluster(atAngle, "carrot_arc");
            }
            else if (roll < 0.68) {
                this.spawnCluster(atAngle, roll < 0.60 ? "weapon_pod" : (roll < 0.64 ? "magnet_powerup" : "shield_powerup"));
            }
            else if (roll < 0.84) {
                this.spawnCluster(atAngle, "crater_with_carrots");
            }
            else {
                this.spawnCluster(atAngle, "boost_pad");
            }
            return;
        }
        if (this.lap === 1) {
            // Vuelta 1: Introductoria (Zanahorias, Cráteres, Rampas y Vigas Bajas de Slide)
            if (roll < 0.32)
                this.spawnCluster(atAngle, "carrot_arc");
            else if (roll < 0.50)
                this.spawnCluster(atAngle, "low_beam");
            else if (roll < 0.72)
                this.spawnCluster(atAngle, "boost_pad");
            else if (roll < 0.88)
                this.spawnCluster(atAngle, "crater");
            else
                this.spawnCluster(atAngle, roll < 0.94 ? "weapon_pod" : (roll < 0.97 ? "magnet_powerup" : "shield_powerup"));
        }
        else if (this.lap === 2) {
            // Vuelta 2: Intermedia (Vigas de Slide, Púas y Cráteres)
            if (roll < 0.25)
                this.spawnCluster(atAngle, "low_beam");
            else if (roll < 0.45)
                this.spawnCluster(atAngle, "spikes");
            else if (roll < 0.65)
                this.spawnCluster(atAngle, "carrot_arc");
            else if (roll < 0.82)
                this.spawnCluster(atAngle, "crater_with_carrots");
            else
                this.spawnCluster(atAngle, roll < 0.88 ? "weapon_pod" : (roll < 0.94 ? "magnet_powerup" : "shield_powerup"));
        }
        else {
            // Vuelta 3+: Ritmo rápido
            if (roll < 0.25)
                this.spawnCluster(atAngle, "low_beam");
            else if (roll < 0.45)
                this.spawnCluster(atAngle, "spikes");
            else if (roll < 0.65)
                this.spawnCluster(atAngle, "crater_with_carrots");
            else if (roll < 0.82)
                this.spawnCluster(atAngle, "mine");
            else if (roll < 0.92)
                this.spawnCluster(atAngle, "boost_pad");
            else
                this.spawnCluster(atAngle, roll < 0.96 ? "shield_powerup" : "magnet_powerup");
        }
    }
    spawnCluster(baseAngle, pattern) {
        if (pattern === "carrot_arc") {
            const carrotCount = this.scarcityMode ? 2 : 4;
            for (let i = 0; i < carrotCount; i++) {
                const offset = (i - (carrotCount - 1) / 2) * 0.065;
                const alt = this.scarcityMode ? 16 : Math.sin((i / 3) * Math.PI) * 36 + 10;
                this.entities.push({
                    id: this.nextId++,
                    angle: baseAngle + offset,
                    type: "carrot",
                    altitude: alt,
                    size: 14,
                    collected: false
                });
            }
        }
        else if (pattern === "low_beam") {
            this.entities.push({
                id: this.nextId++,
                angle: baseAngle,
                type: "low_beam",
                altitude: 0,
                size: 40
            });
        }
        else if (pattern === "coyote") {
            this.enemies.push(new SpaceCoyote(this.nextId++, baseAngle));
        }
        else if (pattern === "snake") {
            this.enemies.push(new CosmicRattlesnake(this.nextId++, baseAngle));
        }
        else if (pattern === "weapon_pod") {
            this.entities.push({
                id: this.nextId++,
                angle: baseAngle,
                type: "weapon_pod",
                altitude: 20,
                size: 22,
                collected: false
            });
        }
        else if (pattern === "magnet_powerup") {
            this.entities.push({
                id: this.nextId++,
                angle: baseAngle,
                type: "magnet_powerup",
                altitude: 20,
                size: 24,
                collected: false
            });
        }
        else if (pattern === "shield_powerup") {
            this.entities.push({
                id: this.nextId++,
                angle: baseAngle,
                type: "shield_powerup",
                altitude: 22,
                size: 26,
                collected: false
            });
        }
        else if (pattern === "crater") {
            this.entities.push({
                id: this.nextId++,
                angle: baseAngle,
                type: "crater",
                altitude: 0,
                size: 26
            });
        }
        else if (pattern === "spikes") {
            this.entities.push({
                id: this.nextId++,
                angle: baseAngle,
                type: "spikes",
                altitude: 0,
                size: 22
            });
        }
        else if (pattern === "spikes_with_carrots") {
            this.entities.push({
                id: this.nextId++,
                angle: baseAngle,
                type: "spikes",
                altitude: 0,
                size: 22
            });
            const carrotCount = this.scarcityMode ? 1 : 3;
            for (let i = 0; i < carrotCount; i++) {
                const offset = carrotCount === 1 ? 0 : (i - 1) * 0.055;
                this.entities.push({
                    id: this.nextId++,
                    angle: baseAngle + offset,
                    type: "carrot",
                    altitude: 45,
                    size: 14,
                    collected: false
                });
            }
        }
        else if (pattern === "mine") {
            this.entities.push({
                id: this.nextId++,
                angle: baseAngle,
                type: "mine",
                altitude: 35,
                size: 18
            });
        }
        else if (pattern === "boost_pad") {
            this.entities.push({
                id: this.nextId++,
                angle: baseAngle,
                type: "boost_pad",
                altitude: 0,
                size: 28
            });
        }
        else if (pattern === "crater_with_carrots") {
            this.entities.push({
                id: this.nextId++,
                angle: baseAngle,
                type: "crater",
                altitude: 0,
                size: 30
            });
            const carrotCount = this.scarcityMode ? 1 : 3;
            for (let i = 0; i < carrotCount; i++) {
                const offset = carrotCount === 1 ? 0 : (i - 1) * 0.055;
                this.entities.push({
                    id: this.nextId++,
                    angle: baseAngle + offset,
                    type: "carrot",
                    altitude: 45,
                    size: 14,
                    collected: false
                });
            }
        }
    }
    checkCollisions(bunnyCurrentProgress, bunnyAltitude, isWarp, isSliding = false, activeLasers = [], _bunnySpeed = 0, _bunnyTier = "NORMAL") {
        const result = {
            hitHazard: false,
            collectedCarrot: false,
            hitBoostPad: false,
            collectedWeaponPod: false,
            enemiesZapped: 0,
            enemySlowdown: false
        };
        const threshold = 0.045; // ~18px
        // 1. Colisiones con Obstáculos y Coleccionables
        for (const ent of this.entities) {
            if (ent.collected)
                continue;
            const angleDiff = Math.abs(ent.angle - bunnyCurrentProgress);
            if (angleDiff < threshold) {
                if (ent.type === "carrot") {
                    if (Math.abs(bunnyAltitude - ent.altitude) < 26) {
                        ent.collected = true;
                        result.collectedCarrot = true;
                    }
                }
                else if (ent.type === "weapon_pod") {
                    // Recoge la cápsula de energía [⚡] para supercarga de turbo (tolerancia de 42px para suelo y aire)
                    if (Math.abs(bunnyAltitude - ent.altitude) < 42) {
                        ent.collected = true;
                        result.collectedWeaponPod = true;
                    }
                }
                else if (ent.type === "magnet_powerup") {
                    if (Math.abs(bunnyAltitude - ent.altitude) < 38) {
                        ent.collected = true;
                        result.collectedMagnet = true;
                    }
                }
                else if (ent.type === "shield_powerup") {
                    if (Math.abs(bunnyAltitude - ent.altitude) < 38) {
                        ent.collected = true;
                        result.collectedShield = true;
                    }
                }
                else if (ent.type === "boost_pad") {
                    if (bunnyAltitude <= 12) {
                        result.hitBoostPad = true;
                    }
                }
                else if (ent.type === "crater" || ent.type === "spikes") {
                    if (bunnyAltitude < 18 && !isWarp) {
                        result.hitHazard = true;
                    }
                }
                else if (ent.type === "low_beam") {
                    // Barrera baja: rayo láser de plasma elevado suspendido a 24-34px de altura
                    // - En Slide Dash: silueta aplanada (altura ~14px), pasa 100% holgado por el túnel de 24px
                    // - En carrera erguida (altura ~32px): impacta contra el rayo
                    // - En salto alto (altitud >= 38px): supera la estructura por arriba
                    if (!isWarp) {
                        if (!isSliding && bunnyAltitude < 38) {
                            result.hitHazard = true;
                        }
                    }
                }
                else if (ent.type === "mine") {
                    if (Math.abs(bunnyAltitude - ent.altitude) < 18 && !isWarp) {
                        result.hitHazard = true;
                    }
                }
            }
        }
        // 2. Colisiones del Conejo contra Villanos
        // Al chocar con un villano en tierra, este es derrotado pero frena un poco al conejo
        for (const enemy of this.enemies) {
            if (!enemy.active)
                continue;
            const angleDiff = Math.abs(enemy.angle - bunnyCurrentProgress);
            if (angleDiff < threshold) {
                if (bunnyAltitude < 24) {
                    // El villano es noqueado/derrotado
                    enemy.active = false;
                    result.enemiesZapped++;
                    // A menos que esté en modo WARP invulnerable, el impacto frena un poco al conejo
                    if (!isWarp) {
                        result.enemySlowdown = true;
                    }
                }
            }
        }
        // 3. Colisiones de Láser Cóncavo contra Villanos
        for (const laser of activeLasers) {
            if (!laser.active)
                continue;
            for (const enemy of this.enemies) {
                if (!enemy.active)
                    continue;
                // Comprueba si el arco láser intersecta con el ángulo del villano
                if (enemy.angle >= laser.angle && enemy.angle <= laser.angle + laser.arcLength + 0.03) {
                    enemy.active = false; // Desintegrado!
                    laser.active = false;
                    result.enemiesZapped++;
                }
            }
        }
        return result;
    }
    getRemainingMeters(targetDistance, planetRadius = 400) {
        const diffRad = Math.max(0, targetDistance - this.accumulatedAngle);
        return Math.round(diffRad * planetRadius * 0.45);
    }
    render(ctx, planet, worldRotationOffset, targetDistance) {
        // 1. Renderizar Nave Nodriza si está volando
        this.renderMothership(ctx);
        // 1.5. Renderizar Cosmic Warp Gate en la meta si está en campo visual
        if (targetDistance !== undefined) {
            this.renderWarpGate(ctx, planet, worldRotationOffset, targetDistance);
        }
        // 2. Renderizar Obstáculos y Cápsulas
        for (const ent of this.entities) {
            if (ent.collected)
                continue;
            const visualAngle = AstroBunny.PLAYER_ANCHOR_ANGLE + (ent.angle - worldRotationOffset);
            if (Math.abs(visualAngle - AstroBunny.PLAYER_ANCHOR_ANGLE) > 1.25)
                continue;
            const currentRadius = planet.radius + ent.altitude;
            const pos = PolarMath.polarToCartesian(planet.x, planet.y, currentRadius, visualAngle);
            ctx.save();
            ctx.translate(pos.x, pos.y);
            ctx.rotate(visualAngle + Math.PI / 2);
            if (ent.type === "weapon_pod") {
                // Cápsula retro cuadrada estilo Contra Alien Wars con icono [L]
                const pulse = Math.sin(performance.now() * 0.01) * 2;
                ctx.fillStyle = "#ef4444";
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.roundRect(-10, -10 + pulse, 20, 20, 4);
                ctx.fill();
                ctx.stroke();
                // Icono de Rayo de Energía para Turbo
                ctx.fillStyle = "#ffffff";
                ctx.font = "bold 13px system-ui";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText("⚡", 0, pulse);
                // Pequeño paracaídas de energía superior
                ctx.strokeStyle = "rgba(0, 229, 255, 0.6)";
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(0, -16 + pulse, 10, Math.PI, 0);
                ctx.stroke();
            }
            else if (ent.type === "magnet_powerup") {
                // Ícono de Imán Cósmico (Herradura magnética con polos polarizados)
                const pulse = Math.sin(performance.now() * 0.008) * 3;
                ctx.save();
                ctx.translate(0, pulse);
                ctx.shadowColor = "#f59e0b";
                ctx.shadowBlur = 10;
                // Herradura curva
                ctx.lineWidth = 4;
                ctx.strokeStyle = "#ef4444";
                ctx.beginPath();
                ctx.arc(0, -2, 8, Math.PI, 0, false);
                ctx.stroke();
                // Polos magnéticos
                ctx.fillStyle = "#38bdf8";
                ctx.fillRect(-10, -2, 4, 7);
                ctx.fillStyle = "#ef4444";
                ctx.fillRect(6, -2, 4, 7);
                // Chispa electromagnética central
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.arc(0, 2, 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
            else if (ent.type === "shield_powerup") {
                // Ícono de Escudo de Plasma (Orbe cian reluciente con halo orbital)
                const pulse = Math.sin(performance.now() * 0.009) * 2.5;
                ctx.save();
                ctx.translate(0, pulse);
                ctx.shadowColor = "#00e5ff";
                ctx.shadowBlur = 12;
                ctx.fillStyle = "rgba(0, 229, 255, 0.4)";
                ctx.strokeStyle = "#38bdf8";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(0, 0, 9, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                // Anillo orbital giratorio
                ctx.rotate(performance.now() * 0.004);
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.ellipse(0, 0, 13, 5, 0, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }
            else if (ent.type === "carrot") {
                ctx.fillStyle = "#ffaa00";
                ctx.beginPath();
                ctx.ellipse(0, 0, 4.5, 9, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#00ff88";
                ctx.fillRect(-2, -12, 4, 4);
            }
            else if (ent.type === "boost_pad") {
                ctx.fillStyle = "#00ff88";
                ctx.beginPath();
                ctx.moveTo(-ent.size / 2, 0);
                ctx.lineTo(ent.size / 2, 0);
                ctx.lineTo(ent.size / 3, -7);
                ctx.lineTo(-ent.size / 3, -7);
                ctx.closePath();
                ctx.fill();
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(-5, -2);
                ctx.lineTo(0, -5);
                ctx.lineTo(5, -2);
                ctx.stroke();
            }
            else if (ent.type === "crater") {
                ctx.fillStyle = "#ff2200";
                ctx.beginPath();
                ctx.ellipse(0, 2, ent.size / 2, 4, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = "#ffaa00";
                ctx.lineWidth = 2;
                ctx.stroke();
            }
            else if (ent.type === "spikes") {
                ctx.fillStyle = "#e11d48";
                ctx.strokeStyle = "#fb7185";
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(-ent.size / 2, 0);
                ctx.lineTo(-ent.size / 4, -ent.size * 0.75);
                ctx.lineTo(0, 0);
                ctx.lineTo(ent.size / 4, -ent.size);
                ctx.lineTo(ent.size / 2, 0);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }
            else if (ent.type === "mine") {
                const blink = Math.sin(performance.now() * 0.01) > 0;
                ctx.fillStyle = "#1e293b";
                ctx.strokeStyle = blink ? "#ef4444" : "#94a3b8";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(0, 0, ent.size / 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                ctx.fillStyle = blink ? "#ff0000" : "#7f1d1d";
                ctx.beginPath();
                ctx.arc(0, 0, 4, 0, Math.PI * 2);
                ctx.fill();
            }
            else if (ent.type === "low_beam") {
                // Barrera de plasma baja elevada con túnel inferior espacioso de 24px
                // 1. Postes laterales mecánicos anclados desde Y=0 (suelo) hasta Y=-42
                ctx.fillStyle = "#334155";
                ctx.strokeStyle = "#475569";
                ctx.lineWidth = 1.2;
                ctx.fillRect(-17, -42, 6, 42);
                ctx.strokeRect(-17, -42, 6, 42);
                ctx.fillRect(11, -42, 6, 42);
                ctx.strokeRect(11, -42, 6, 42);
                // 2. Bases de anclaje mecánicas en la superficie
                ctx.fillStyle = "#1e293b";
                ctx.fillRect(-19, -4, 10, 4);
                ctx.fillRect(9, -4, 10, 4);
                // 3. Bobinas y emisores de plasma en los postes
                ctx.fillStyle = "#00e5ff";
                ctx.fillRect(-16, -39, 4, 3);
                ctx.fillRect(12, -39, 4, 3);
                ctx.fillStyle = "#f43f5e";
                ctx.beginPath();
                ctx.arc(-14, -29, 3.5, 0, Math.PI * 2);
                ctx.arc(14, -29, 3.5, 0, Math.PI * 2);
                ctx.fill();
                // 4. Rayo láser de plasma elevado (suspendido de 24px a 34px, túnel libre de 24px abajo)
                const laserPulse = Math.sin(performance.now() * 0.02) * 0.25 + 0.75;
                ctx.save();
                ctx.shadowColor = "#f43f5e";
                ctx.shadowBlur = 12;
                ctx.fillStyle = `rgba(244, 63, 94, ${laserPulse})`;
                ctx.fillRect(-12, -34, 24, 10);
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(-11, -31, 22, 4); // Núcleo incandescente del rayo
                // Micro-chispa de plasma activa
                const sparkOffset = Math.sin(performance.now() * 0.035) * 8;
                ctx.fillStyle = "#fecdd3";
                ctx.fillRect(-2 + sparkOffset, -33, 4, 8);
                ctx.restore();
                // 5. Señalética holográfica superior
                ctx.fillStyle = "#38bdf8";
                ctx.font = "bold 8.5px system-ui";
                ctx.textAlign = "center";
                ctx.fillText("▼ SLIDE DASH ▼", 0, -46);
            }
            ctx.restore();
        }
        // 3. Renderizar Villanos
        for (const enemy of this.enemies) {
            enemy.render(ctx, planet, worldRotationOffset);
        }
    }
    renderMothership(ctx) {
        if (!this.mothershipActive)
            return;
        ctx.save();
        ctx.translate(this.mothershipX, this.mothershipY);
        // Domo superior de la nave
        ctx.fillStyle = "#38bdf8";
        ctx.beginPath();
        ctx.arc(0, -4, 9, Math.PI, 0);
        ctx.fill();
        // Disco platillo volador
        ctx.fillStyle = "#64748b";
        ctx.strokeStyle = "#00e5ff";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(0, 0, 24, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Luces inferiores parpadeantes
        const lightOffset = (performance.now() * 0.008) % Math.PI;
        ctx.fillStyle = Math.sin(lightOffset) > 0 ? "#ff0055" : "#00ff88";
        ctx.beginPath();
        ctx.arc(-12, 2, 2, 0, Math.PI * 2);
        ctx.arc(0, 3, 2, 0, Math.PI * 2);
        ctx.arc(12, 2, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    renderWarpGate(ctx, planet, worldRotationOffset, targetDistance) {
        const visualAngle = AstroBunny.PLAYER_ANCHOR_ANGLE + (targetDistance - worldRotationOffset);
        if (Math.abs(visualAngle - AstroBunny.PLAYER_ANCHOR_ANGLE) > 1.35)
            return;
        const currentRadius = planet.radius;
        const pos = PolarMath.polarToCartesian(planet.x, planet.y, currentRadius, visualAngle);
        ctx.save();
        ctx.translate(pos.x, pos.y);
        ctx.rotate(visualAngle + Math.PI / 2);
        const now = performance.now();
        const pulse = Math.sin(now * 0.006) * 0.2 + 0.8;
        // Vórtice interior de energía Warp
        const vortexGrad = ctx.createRadialGradient(0, -45, 5, 0, -45, 42);
        vortexGrad.addColorStop(0, `rgba(255, 255, 255, ${0.85 * pulse})`);
        vortexGrad.addColorStop(0.4, `rgba(0, 229, 255, ${0.65 * pulse})`);
        vortexGrad.addColorStop(0.8, `rgba(168, 85, 247, ${0.4 * pulse})`);
        vortexGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = vortexGrad;
        ctx.beginPath();
        ctx.arc(0, -45, 40, 0, Math.PI * 2);
        ctx.fill();
        // Corrientes de Viento a Favor y Rampa Térmica Pre-Meta
        ctx.save();
        const windPhase = (now * 0.008) % 1;
        for (let i = 0; i < 5; i++) {
            const streamX = -120 + i * 22 + windPhase * 20;
            const streamY = -6 - i * 5;
            ctx.strokeStyle = i % 2 === 0 ? "rgba(0, 229, 255, 0.75)" : "rgba(250, 204, 21, 0.75)";
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(streamX, 0);
            ctx.quadraticCurveTo(streamX + 15, streamY - 20, streamX + 35, streamY - 45);
            ctx.stroke();
            // Partícula de flecha ascendente
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(streamX + 35, streamY - 45, 2.2, 0, Math.PI * 2);
            ctx.fill();
        }
        // Señalética holográfica de Viento a Favor
        ctx.fillStyle = "#38bdf8";
        ctx.font = "bold 9px system-ui";
        ctx.textAlign = "center";
        ctx.shadowColor = "#00e5ff";
        ctx.shadowBlur = 8;
        ctx.fillText("💨 VIENTO A FAVOR ▲▲ MEGA SALTO", -60, -32);
        ctx.restore();
        // Columnas laterales del portal
        ctx.fillStyle = "#1e293b";
        ctx.strokeStyle = "#00e5ff";
        ctx.lineWidth = 2.5;
        // Columna Izquierda y Derecha
        ctx.fillRect(-38, -80, 8, 80);
        ctx.strokeRect(-38, -80, 8, 80);
        ctx.fillRect(30, -80, 8, 80);
        ctx.strokeRect(30, -80, 8, 80);
        // Luces de neón verticales
        ctx.fillStyle = "#00e5ff";
        ctx.shadowColor = "#00e5ff";
        ctx.shadowBlur = 10;
        ctx.fillRect(-36, -74, 4, 68);
        ctx.fillRect(32, -74, 4, 68);
        // Arco superior neón
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(-42, -92, 84, 16);
        ctx.strokeRect(-42, -92, 84, 16);
        // Patrón holográfico de cuadros (Checkered Banner)
        const cols = 8;
        const boxW = 80 / cols;
        for (let c = 0; c < cols; c++) {
            ctx.fillStyle = c % 2 === 0 ? "#10b981" : "#000000";
            ctx.fillRect(-40 + c * boxW, -90, boxW, 12);
        }
        // Letrero holográfico superior
        ctx.shadowColor = "#10b981";
        ctx.shadowBlur = 12;
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 9px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("WARP GATE", 0, -84);
        ctx.restore();
    }
}
