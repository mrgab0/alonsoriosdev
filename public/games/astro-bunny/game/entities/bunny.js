import { Actor } from "./actor.js";
import { PolarMath } from "../../core/math.js";
import { InputManager } from "../../core/input.js";
import { ExhaustEmitter } from "../fx/exhaust.js";
import { CurvedLaser } from "../weapons/laser.js";
export class AstroBunny extends Actor {
    currentTier = "NORMAL";
    health = 100;
    maxHealth = 100;
    invulnerableTimer = 0;
    healPopupTimer = 0;
    cosmicEnergy = 100;
    maxEnergy = 100;
    warpTimer = 0;
    // Mecánica Hang-Time (Turbo Kids)
    isHanging = false;
    hangTimer = 0;
    canHang = true;
    // Mecánica Nitro Manual Sumador (Estilo Asphalt con Histéresis Anti-Parpadeo)
    static MIN_NITRO_IGNITION = 6.0;
    isManualNitro = false;
    nitroDepleted = false;
    // Mecánica Slide (Deslizamiento / Barrida Aerodinámica)
    isSliding = false;
    slideTimer = 0;
    maxSlideDuration = 0.5;
    // Armamento (Contra Alien Wars Style)
    laserAmmo = 0;
    // Inercia de Gravedad y Esfuerzo de Arranque (Punto Muerto)
    effortTimer = 0;
    effortThreshold = 0.12; // 120ms de flexión preparatoria contra la gravedad
    sprintTimer = 0; // Acumulador de velocidad continua de sprint
    // Contador de zanahorias recogidas
    carrotsCollected = 0;
    // Estado de impacto / tropiezo
    stumbleTimer = 0;
    // Estado de celebración triunfal (Desenlace de nivel)
    isCelebrating = false;
    // Power-Ups Cósmicos y Skins (v1.1.0)
    magnetTimer = 0;
    hasShield = false;
    shieldPopTimer = 0;
    selectedSkin = "classic_rabbit";
    activateMagnet(duration = 8.0) {
        this.magnetTimer = Math.max(this.magnetTimer, duration);
    }
    activateShield() {
        this.hasShield = true;
    }
    consumeShield() {
        if (this.hasShield) {
            this.hasShield = false;
            this.shieldPopTimer = 0.6;
            this.invulnerableTimer = 1.8;
            return true;
        }
        return false;
    }
    // Animaciones
    runAnimTimer = 0;
    earTilt = 0;
    squishY = 1.0;
    // Posición de anclaje de la cámara y del jugador (desplazado ~3.15° hacia la izquierda, X ≈ 136px)
    static PLAYER_ANCHOR_ANGLE = -Math.PI / 2 - 0.055;
    exhaust = new ExhaustEmitter();
    constructor(initialAngle = AstroBunny.PLAYER_ANCHOR_ANGLE, initialAltitude = 0) {
        super(initialAngle, initialAltitude);
        this.baseHeight = 14;
        // Anclado en la posición arcade runner (~38% de ancho de pantalla)
        this.planetAngle = AstroBunny.PLAYER_ANCHOR_ANGLE;
    }
    update(dt, planet) {
        const input = InputManager.getInstance();
        const isLeft = input.isMovingLeft();
        const isRight = input.isMovingRight();
        const isTurbo = input.isTurbo();
        const turboPressed = input.wasTurboJustPressed();
        const jumpPressed = input.wasJumpJustPressed();
        const slideActive = input.isSliding();
        // 1. Temporizadores de estado
        if (this.stumbleTimer > 0)
            this.stumbleTimer -= dt;
        if (this.invulnerableTimer > 0)
            this.invulnerableTimer -= dt;
        if (this.healPopupTimer > 0)
            this.healPopupTimer -= dt;
        // 2. Turbo Automático Progresivo por Momentum y Nitro Manual Sumador (Estilo Asphalt)
        if (this.warpTimer > 0) {
            this.warpTimer -= dt;
            this.currentTier = "WARP";
            if (this.warpTimer <= 0) {
                this.warpTimer = 0;
                this.currentTier = "NORMAL";
            }
        }
        else {
            // Disparo automático de Warp al alcanzar el 100% de Momentum
            if (this.cosmicEnergy >= 100) {
                this.warpTimer = 3.5;
                this.cosmicEnergy = 0;
                this.currentTier = "WARP";
            }
            else if (this.cosmicEnergy >= 80) {
                this.currentTier = "PLASMA"; // Fase 2 Automática
            }
            else if (this.cosmicEnergy >= 50) {
                this.currentTier = "COMBUSTION"; // Fase 1 Automática
            }
            else {
                this.currentTier = "NORMAL";
            }
            // Ganancia de momentum pasiva muy sutil por mantener marcha continua sin chocar
            if (this.isGrounded && Math.abs(this.angularVelocity) > 0.12 && this.stumbleTimer <= 0 && !this.isManualNitro) {
                this.cosmicEnergy = Math.min(this.maxEnergy, this.cosmicEnergy + 0.8 * dt);
            }
        }
        // Reset del bloqueo de depleción al soltar el botón de turbo
        if (!isTurbo) {
            this.nitroDepleted = false;
        }
        // 2.5 Nitro Manual Aditivo (Sumador estilo Asphalt con Histéresis Anti-Parpadeo)
        const wasNitroActive = this.isManualNitro;
        this.isManualNitro = false;
        if (isTurbo && !this.nitroDepleted && this.stumbleTimer <= 0) {
            // Requiere umbral mínimo (MIN_NITRO_IGNITION) para encender, o tener energía si ya venía activo
            const canBurn = wasNitroActive ? this.cosmicEnergy > 0 : this.cosmicEnergy >= AstroBunny.MIN_NITRO_IGNITION;
            if (canBurn) {
                this.isManualNitro = true;
                // Quemado rápido y explosivo de nitro estilo ráfaga (55 unidades por segundo: "durar menos")
                this.cosmicEnergy = Math.max(0, this.cosmicEnergy - 55 * dt);
                // Impulso inicial explosivo de cohete idéntico a un Boost Pad (+0.22 rad/s)
                if (turboPressed || !wasNitroActive) {
                    this.facingRight = true;
                    this.angularVelocity = Math.min(0.68, Math.max(this.angularVelocity + 0.22, 0.60));
                }
                if (this.cosmicEnergy <= 0) {
                    this.cosmicEnergy = 0;
                    this.isManualNitro = false;
                    this.nitroDepleted = true; // Bloquea la re-ignición por residuos mientras se mantenga presionado
                }
                else {
                    // Emisión de partículas de estela de escape nitro
                    const pos = this.getPosition(planet);
                    const exhaustTier = this.currentTier === "WARP" ? "WARP" : "PLASMA";
                    this.exhaust.emit(pos.x, pos.y, this.planetAngle + Math.PI, exhaustTier);
                }
            }
            else {
                this.nitroDepleted = true;
            }
        }
        // 3. Multiplicadores de velocidad tangencial y acumulación progresiva
        let speedMultiplier = 1.0;
        if (this.currentTier === "WARP")
            speedMultiplier = 2.0;
        else if (this.currentTier === "PLASMA")
            speedMultiplier = 1.55;
        else if (this.currentTier === "COMBUSTION")
            speedMultiplier = 1.25;
        // Sumador manual de Nitro estilo Asphalt (+0.45x en velocidad base o +0.50x en WARP Shockwave)
        if (this.isManualNitro) {
            speedMultiplier += (this.currentTier === "WARP" ? 0.50 : 0.45);
        }
        if (this.stumbleTimer > 0) {
            speedMultiplier *= 0.55; // Ralentización por tropiezo
            this.sprintTimer = 0;
        }
        else if (isRight && this.isGrounded) {
            // Acumulación progresiva por sprint continuo sostenido
            this.sprintTimer = Math.min(6.0, this.sprintTimer + dt);
        }
        else if (!isRight) {
            this.sprintTimer = Math.max(0, this.sprintTimer - dt * 2.5);
        }
        // 4. Gestión del Slide (Deslizamiento / Barrida Aerodinámica con Impulso hacia Adelante)
        if (slideActive && this.isGrounded && this.stumbleTimer <= 0) {
            if (!this.isSliding) {
                this.isSliding = true;
                this.slideTimer = this.maxSlideDuration;
                this.facingRight = true;
                // Impulso hacia adelante inmediato (Slide Dash):
                const slideMinImpulse = 0.44 * speedMultiplier;
                this.angularVelocity = Math.max(slideMinImpulse, this.angularVelocity * 1.25);
            }
        }
        if (this.isSliding) {
            this.slideTimer -= dt;
            this.squishY = 0.45; // Silueta muy aplanada para pasar bajo obstáculos
            this.earTilt = 0.35;
            this.facingRight = true;
            // Mantener velocidad de barrida aerodinámica continua (mínimo 0.36 rad/s)
            const sustainSpeed = 0.36 * speedMultiplier;
            if (this.angularVelocity < sustainSpeed) {
                this.angularVelocity = sustainSpeed;
            }
            // Chispas de fricción y estela de propulsión bajo los pies
            const pos = this.getPosition(planet);
            this.exhaust.emit(pos.x, pos.y, this.planetAngle + Math.PI, "COMBUSTION");
            if (this.slideTimer <= 0 || !this.isGrounded) {
                this.isSliding = false;
                this.squishY = 1.0;
            }
        }
        // Bonificaciones sutiles para planeta R=780: sprint (+0.08 rad/s) y momentum (+0.10 rad/s)
        const sprintBonus = (this.sprintTimer / 6.0) * 0.08;
        const momentumBonus = (this.cosmicEnergy / this.maxEnergy) * 0.10;
        // Velocidad base dócil de trote (0.24 rad/s ~185 px/s en R=780), escalando gradualmente
        let maxSpeed = (0.24 + sprintBonus + momentumBonus) * speedMultiplier;
        // En modo Nitro Manual: desbloquea velocidad punta supersónica (0.66 rad/s) idéntica a los Boost Pads
        if (this.isManualNitro) {
            const nitroCeiling = this.currentTier === "WARP" ? 0.72 : 0.66;
            maxSpeed = Math.max(maxSpeed, nitroCeiling + sprintBonus * 0.5);
        }
        // Aceleración suave y orgánica desde reposo (~0.48 rad/s²), con empuje de cohete con Nitro (+2.60 rad/s²)
        let baseAccel = 0.48 + (sprintBonus + momentumBonus) * 0.4;
        if (this.isManualNitro) {
            baseAccel += 2.60;
        }
        // 4. Inercia de Gravedad, Punto Muerto y Control Manual Progresivo
        if (isRight || this.isManualNitro) {
            this.facingRight = true;
            if (Math.abs(this.angularVelocity) < 0.06 && this.effortTimer < this.effortThreshold && !this.isManualNitro) {
                this.effortTimer += dt;
                this.squishY = 0.90; // Compresión muscular preparatoria suave
                this.earTilt = -0.10;
                this.angularVelocity += baseAccel * dt * 0.45; // Tracción inicial dócil
            }
            else {
                this.angularVelocity = Math.min(maxSpeed, this.angularVelocity + baseAccel * dt);
            }
        }
        else if (isLeft) {
            this.facingRight = false;
            if (Math.abs(this.angularVelocity) < 0.06 && this.effortTimer < this.effortThreshold) {
                this.effortTimer += dt;
                this.squishY = 0.90;
                this.earTilt = 0.10;
                this.angularVelocity -= baseAccel * dt * 0.4;
            }
            else {
                this.angularVelocity = Math.max(-0.25, this.angularVelocity - baseAccel * dt);
            }
        }
        else {
            // Sin input: Reset del esfuerzo y frenado por fricción hacia reposo absoluto (salvo si está en Slide Dash)
            this.effortTimer = 0;
            if (!this.isSliding) {
                const friction = 1.4;
                if (this.angularVelocity > 0) {
                    this.angularVelocity = Math.max(0, this.angularVelocity - friction * dt);
                }
                else if (this.angularVelocity < 0) {
                    this.angularVelocity = Math.min(0, this.angularVelocity + friction * dt);
                }
                if (Math.abs(this.angularVelocity) < 0.01) {
                    this.angularVelocity = 0;
                }
            }
        }
        const currentMaxSpeed = this.isSliding ? Math.max(maxSpeed, 0.48 * speedMultiplier) : maxSpeed;
        if (this.angularVelocity > currentMaxSpeed) {
            // Planeo inercial aerodinámico post-nitro o post-boost: decae suavemente sin frenazos bruscos
            this.angularVelocity = Math.max(currentMaxSpeed, this.angularVelocity - 0.75 * dt);
            this.angularVelocity = Math.max(-0.3, this.angularVelocity);
        }
        else {
            this.angularVelocity = PolarMath.clamp(this.angularVelocity, -0.3, currentMaxSpeed);
        }
        // 5. Salto y Turbo Kids Hang-Time (Micro-sustentación aérea de 220ms)
        if (jumpPressed && this.stumbleTimer <= 0) {
            if (this.isGrounded) {
                // Slide-Jump Canceling: Cancela inmediatamente la barrida al despegar en salto sin latencia
                this.isSliding = false;
                this.radialVelocity = 480;
                this.isGrounded = false;
                this.canHang = true;
                this.isHanging = false;
                this.squishY = 1.35;
            }
            else if (this.canHang && this.altitude > 12) {
                // Segundo toque en el aire -> Activa suspensión Hang-Time de 220ms
                this.isHanging = true;
                this.hangTimer = 0.22;
                this.canHang = false;
                this.radialVelocity = 35; // Impulso mínimo de suspensión
            }
        }
        // 6. Gravedad radial con soporte de Hang-Time
        const wasInAir = !this.isGrounded;
        if (this.isHanging) {
            this.hangTimer -= dt;
            this.radialVelocity = Math.max(-25, this.radialVelocity - 160 * dt); // Gravedad atenuada al 90%
            this.altitude += this.radialVelocity * dt;
            // Micro-chispas de sustentación del jetpack en hang-time
            const pos = this.getPosition(planet);
            this.exhaust.emit(pos.x, pos.y, this.planetAngle + Math.PI, "PLASMA");
            if (this.hangTimer <= 0) {
                this.isHanging = false;
            }
        }
        else {
            this.applyPlanetaryGravity(dt, planet);
        }
        const maxAltitude = 135;
        if (this.altitude >= maxAltitude) {
            this.altitude = maxAltitude;
            if (this.radialVelocity > 0)
                this.radialVelocity = 0;
        }
        if (wasInAir && this.isGrounded) {
            this.canHang = true;
            this.isHanging = false;
            this.squishY = 0.72;
        }
        this.squishY += (1.0 - this.squishY) * 0.16;
        // 7. Orejas y piernas animadas (Se detienen limpiamente en reposo o celebran al cruzar la meta)
        if (this.isCelebrating) {
            this.isGrounded = false;
            this.runAnimTimer += 14 * dt;
            this.altitude = 24 + Math.sin(this.runAnimTimer * 0.4) * 12;
            this.earTilt = Math.sin(this.runAnimTimer * 0.8) * 0.35;
            this.squishY = 1.0 + Math.sin(this.runAnimTimer * 0.5) * 0.08;
            this.angularVelocity = Math.max(0.55, this.angularVelocity);
        }
        else if (Math.abs(this.angularVelocity) > 0.01) {
            this.earTilt = -this.angularVelocity * 0.22;
            if (this.isGrounded) {
                this.runAnimTimer += Math.abs(this.angularVelocity) * 16 * dt;
            }
        }
        else {
            this.earTilt *= 0.82;
            this.runAnimTimer = 0; // Postura erguida de pie al estar quieto
        }
        // 8. Partículas de propulsor
        if (this.currentTier !== "NORMAL" || !this.isGrounded) {
            const pos = this.getPosition(planet);
            const exhaustAngle = this.planetAngle + Math.PI / 2 + Math.PI;
            this.exhaust.emit(pos.x, pos.y, exhaustAngle, this.currentTier === "NORMAL" ? "COMBUSTION" : this.currentTier);
        }
        this.exhaust.update(dt);
        // 9. Actualización de Power-ups (v1.1.0)
        if (this.magnetTimer > 0) {
            this.magnetTimer = Math.max(0, this.magnetTimer - dt);
        }
        if (this.shieldPopTimer > 0) {
            this.shieldPopTimer = Math.max(0, this.shieldPopTimer - dt);
        }
    }
    /**
     * Salto Grandísimo potenciado por Viento a Favor pre-meta
     */
    triggerMegaJump(force = 720) {
        if (this.stumbleTimer > 0)
            return;
        this.radialVelocity = force;
        this.isGrounded = false;
        this.canHang = true;
        this.isHanging = false;
        this.squishY = 1.45;
    }
    hitHazard() {
        if (this.currentTier === "WARP" || this.invulnerableTimer > 0)
            return; // Invulnerable en modo Warp o por i-frames
        this.invulnerableTimer = 1.2; // 1.2s de tiempo de invulnerabilidad
        this.stumbleTimer = 0.65;
        this.health = Math.max(0, this.health - 20); // Daño moderado: 5 impactos de vida
        this.cosmicEnergy = Math.max(0, this.cosmicEnergy - 25); // Pérdida de momentum por obstáculo
        this.angularVelocity *= 0.4; // Freno por impacto
        this.isSliding = false;
        this.radialVelocity = 180; // Pequeño rebote de dolor
        this.isGrounded = false;
        this.sprintTimer = 0;
    }
    /**
     * Frenado suave hacia adelante por impacto con enemigo (sin retroceso ni vuelo)
     */
    applyEnemySlowdown() {
        if (this.currentTier === "WARP" || this.invulnerableTimer > 0)
            return;
        this.invulnerableTimer = 0.55; // Ventana de i-frames para no encadenar frenadas consecutivas
        this.stumbleTimer = 0.28; // Fricción visual breve
        this.squishY = 0.82; // Compresión por impacto
        // Frena un ~38% de la velocidad actual manteniendo siempre la marcha hacia adelante
        this.angularVelocity = Math.max(0.08, this.angularVelocity * 0.62);
        // Reduce la inercia de sprint acumulada y un poco de momentum
        this.sprintTimer *= 0.4;
        this.cosmicEnergy = Math.max(0, this.cosmicEnergy - 8);
    }
    collectCarrot(healAmount = 12, energyAmount = 3.5) {
        this.carrotsCollected++;
        // Zanahorias: Curan vida (+12 HP base, o +8 HP en escasez) y potencian el momentum del turbo
        this.health = Math.min(this.maxHealth, this.health + healAmount);
        this.cosmicEnergy = Math.min(this.maxEnergy, this.cosmicEnergy + energyAmount);
        this.healPopupTimer = 0.8;
    }
    addEnergyPod(amount = 12) {
        // Contenedores de energía: Super carga de momentum (+12%)
        this.cosmicEnergy = Math.min(this.maxEnergy, this.cosmicEnergy + amount);
        this.laserAmmo += 5;
    }
    hitBoostPad() {
        this.cosmicEnergy = Math.min(this.maxEnergy, this.cosmicEnergy + 20);
        this.angularVelocity = Math.min(0.65, this.angularVelocity + 0.22);
    }
    shootLaser() {
        if (this.laserAmmo <= 0)
            return null;
        this.laserAmmo--;
        return new CurvedLaser(this.planetAngle + 0.04, this.altitude);
    }
    addLaserAmmo(count = 5) {
        this.laserAmmo += count;
    }
    render(ctx, planet) {
        this.exhaust.render(ctx);
        const pos = this.getPosition(planet);
        ctx.save();
        ctx.translate(pos.x, pos.y);
        ctx.rotate(this.planetAngle + Math.PI / 2);
        if (!this.facingRight) {
            ctx.scale(-1, 1);
        }
        // Efecto de parpadeo si tropezó o está en periodo de invulnerabilidad
        if ((this.stumbleTimer > 0 || this.invulnerableTimer > 0) && Math.floor(performance.now() * 0.02) % 2 === 0) {
            ctx.globalAlpha = 0.4;
        }
        ctx.scale(1 / Math.sqrt(this.squishY), this.squishY);
        // Aura de propulsor
        if (this.currentTier !== "NORMAL") {
            ctx.fillStyle =
                this.currentTier === "WARP"
                    ? "rgba(255, 255, 255, 0.5)"
                    : this.currentTier === "PLASMA"
                        ? "rgba(0, 229, 255, 0.4)"
                        : "rgba(255, 120, 0, 0.35)";
            ctx.beginPath();
            ctx.arc(0, 0, 22 + Math.sin(performance.now() * 0.03) * 3, 0, Math.PI * 2);
            ctx.fill();
        }
        // Configuración cromática según el Aspecto / Skin equipado (v1.1.0)
        let suitColor = this.currentTier === "WARP" ? "#f8fafc" : "#ffffff";
        let visorColor = this.currentTier === "WARP"
            ? "#ffffff"
            : this.currentTier === "PLASMA"
                ? "#00f0ff"
                : this.currentTier === "COMBUSTION"
                    ? "#ffaa00"
                    : "#00d8f6";
        let earOuterColor = "#e2e8f0";
        let earInnerColor = "#f472b6";
        let jetpackColor = this.currentTier === "WARP" ? "#00ffff" : "#303e5c";
        if (this.selectedSkin === "rocket_mogul") {
            suitColor = "#1e293b";
            visorColor = "#f59e0b";
            earOuterColor = "#334155";
            earInnerColor = "#fcd34d";
            jetpackColor = "#eab308";
        }
        else if (this.selectedSkin === "cosmic_senator") {
            suitColor = "#581c87";
            visorColor = "#c084fc";
            earOuterColor = "#4c1d95";
            earInnerColor = "#e879f9";
            jetpackColor = "#7e22ce";
        }
        else if (this.selectedSkin === "cyber_champion") {
            suitColor = "#fbbf24";
            visorColor = "#f43f5e";
            earOuterColor = "#fef08a";
            earInnerColor = "#fbcfe8";
            jetpackColor = "#f59e0b";
        }
        // Mochila Jetpack
        ctx.fillStyle = jetpackColor;
        ctx.fillRect(-10, -5, 5, 14);
        // Tobera
        ctx.fillStyle = this.currentTier === "WARP" ? "#ffffff" : (this.currentTier === "PLASMA" ? "#00ffff" : "#ff5500");
        ctx.fillRect(-9, 9, 3, 3);
        // Piernas animadas
        const legOffset = Math.sin(this.runAnimTimer) * 4.5;
        ctx.fillStyle = this.selectedSkin === "rocket_mogul" ? "#475569" : (this.selectedSkin === "cyber_champion" ? "#fcd34d" : "#cbd5e1");
        ctx.beginPath();
        ctx.arc(-3, 11 + legOffset, 2.5, 0, Math.PI * 2);
        ctx.arc(3, 11 - legOffset, 2.5, 0, Math.PI * 2);
        ctx.fill();
        // Traje espacial
        ctx.fillStyle = suitColor;
        ctx.beginPath();
        ctx.ellipse(0, 0, 9, 13, 0, 0, Math.PI * 2);
        ctx.fill();
        // Detalle dorado en cuello para trajes especiales
        if (this.selectedSkin === "rocket_mogul" || this.selectedSkin === "cosmic_senator") {
            ctx.strokeStyle = "#fbbf24";
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(0, -2, 6, 0.2, Math.PI - 0.2);
            ctx.stroke();
        }
        // Orejas de conejo
        ctx.save();
        ctx.translate(0, -10);
        ctx.rotate(this.earTilt);
        ctx.fillStyle = earOuterColor;
        ctx.beginPath();
        ctx.ellipse(-4, -6, 3, 7.5, -0.15, 0, Math.PI * 2);
        ctx.ellipse(4, -6, 3, 7.5, 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = earInnerColor;
        ctx.beginPath();
        ctx.ellipse(-4, -6, 1.5, 4.5, -0.15, 0, Math.PI * 2);
        ctx.ellipse(4, -6, 1.5, 4.5, 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        // Visor del casco espacial
        ctx.fillStyle = visorColor;
        ctx.beginPath();
        ctx.arc(2.5, -3, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        ctx.beginPath();
        ctx.arc(4, -4.5, 1.8, 0, Math.PI * 2);
        ctx.fill();
        // Aura de Imán Cósmico activo
        if (this.magnetTimer > 0) {
            ctx.save();
            const magPulse = (performance.now() * 0.006) % 1;
            ctx.strokeStyle = `rgba(251, 191, 36, ${0.85 * (1 - magPulse)})`;
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.arc(0, -12, 11 + magPulse * 14, Math.PI * 0.8, Math.PI * 2.2);
            ctx.stroke();
            ctx.restore();
        }
        // Escudo de Plasma Protector (v1.1.0)
        if (this.hasShield) {
            ctx.save();
            const shieldPulse = Math.sin(performance.now() * 0.008) * 1.8;
            const shieldRadius = 23 + shieldPulse;
            const grad = ctx.createRadialGradient(0, 0, shieldRadius * 0.35, 0, 0, shieldRadius);
            grad.addColorStop(0, "rgba(0, 229, 255, 0.05)");
            grad.addColorStop(0.7, "rgba(0, 229, 255, 0.22)");
            grad.addColorStop(1, "rgba(255, 255, 255, 0.7)");
            ctx.fillStyle = grad;
            ctx.strokeStyle = "#38bdf8";
            ctx.lineWidth = 1.6;
            ctx.shadowColor = "#00e5ff";
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.arc(0, 0, shieldRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            // Anillo orbital giratorio
            ctx.rotate(performance.now() * 0.003);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
            ctx.lineWidth = 1.0;
            ctx.beginPath();
            ctx.ellipse(0, 0, shieldRadius + 3, shieldRadius * 0.45, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
        // Onda de dispersión por rotura del escudo
        if (this.shieldPopTimer > 0) {
            ctx.save();
            const progress = 1 - this.shieldPopTimer / 0.6;
            const popRadius = 22 + progress * 36;
            ctx.strokeStyle = `rgba(56, 189, 248, ${1 - progress})`;
            ctx.lineWidth = 2.5 * (1 - progress);
            ctx.shadowColor = "#38bdf8";
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(0, 0, popRadius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
        ctx.restore();
        // Notificación flotante de recuperación de vida (+12 HP)
        if (this.healPopupTimer > 0) {
            ctx.save();
            const floatOffset = (1 - this.healPopupTimer / 0.8) * 22;
            const alpha = Math.min(1, this.healPopupTimer / 0.25);
            ctx.globalAlpha = alpha;
            ctx.font = "bold 13px system-ui, -apple-system, sans-serif";
            ctx.textAlign = "center";
            ctx.fillStyle = "#10b981";
            ctx.shadowColor = "#34d399";
            ctx.shadowBlur = 8;
            ctx.fillText("+12 HP", pos.x, pos.y - 24 - floatOffset);
            ctx.restore();
        }
    }
}
