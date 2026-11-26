import { drawArcadeText, drawChamferPanel, ARCADE_FONTS } from "../ui/arcadeTheme.js";
export class ChapterFlowController {
    phase = "INTRO_BRIEFING";
    // Temporizadores
    phaseTimer = 0;
    briefingDuration = 1.0;
    countdownStepDuration = 0.55; // 3, 2, 1, GO
    countdownValue = 3;
    lastTickedStep = -1;
    // Actos narrativos durante la carrera
    currentAct = 1;
    bannerText = "";
    bannerSub = "";
    bannerTimer = 0;
    launchBoostAwarded = false;
    // Fin de carrera / Desenlace
    starsEarned = 3;
    outroTimer = 0;
    outroDuration = 2.2;
    // Interludio
    nextLevelTarget = null;
    interludeTimer = 0;
    interludeDuration = 1.6;
    // Nivel activo
    currentLevel = null;
    // Audio ref (opcional para entornos de simulación y testing)
    sound;
    constructor(sound) {
        this.sound = sound;
    }
    /**
     * Inicia la secuencia de introducción para un nuevo nivel
     */
    startLevelIntro(level) {
        this.currentLevel = level;
        this.phase = "INTRO_BRIEFING";
        this.phaseTimer = 0;
        this.countdownValue = 3;
        this.lastTickedStep = -1;
        this.currentAct = 1;
        this.bannerText = "";
        this.bannerSub = "";
        this.bannerTimer = 0;
        this.launchBoostAwarded = false;
        this.outroTimer = 0;
        this.starsEarned = 1;
        this.nextLevelTarget = null;
        this.interludeTimer = 0;
        // Banner de bienvenida táctico adaptado al clima y nivel
        const isHardcore = level.levelNumber >= 17;
        if (level.levelCode === "1-2") {
            this.setBanner("⚠️ TOXIC WIND DETECTED", "TOXIC SMOG SLOWS YOU DOWN IF TOUCHED! KEEP JUMPS LOW!");
        }
        else if (isHardcore) {
            this.setBanner(`☠️ ${level.title.toUpperCase()}`, `${level.subtitle} • 🏁 ${level.targetLaps || 3} Vts • ${level.targetTime}s`);
        }
        else {
            this.setBanner(`CAP. ${level.chapterNumber} • ${level.title.toUpperCase()}`, `${level.subtitle} • 🏁 ${level.targetLaps || 3} Vts`);
        }
    }
    setBanner(title, sub, duration = 2.4) {
        this.bannerText = title;
        this.bannerSub = sub;
        this.bannerTimer = duration;
    }
    /**
     * Actualiza el flujo narrativo y la progresión
     */
    update(dt, progressRatio, _lap, _targetLaps, _timeRemaining, _maxTime, isActionJustPressed) {
        let canCountDownTime = false;
        let weatherIntensity = 1.0;
        let launchBoost = false;
        let transitionToSummary = false;
        let transitionToNextLevel = false;
        if (this.bannerTimer > 0) {
            this.bannerTimer -= dt;
        }
        // 1. FASE INTRO: BRIEFING
        if (this.phase === "INTRO_BRIEFING") {
            this.phaseTimer += dt;
            const isGreenSmog = this.currentLevel?.weatherType === "green_smog";
            const maxBriefing = isGreenSmog ? 3.6 : this.briefingDuration;
            // El jugador puede tocar la pantalla para pasar directamente a la cuenta atrás
            if (this.phaseTimer >= maxBriefing || (isActionJustPressed && this.phaseTimer > 0.35)) {
                this.phase = "INTRO_COUNTDOWN";
                this.phaseTimer = 0;
                this.countdownValue = 3;
            }
        }
        // 2. FASE INTRO: COUNTDOWN
        else if (this.phase === "INTRO_COUNTDOWN") {
            this.phaseTimer += dt;
            const step = Math.floor(this.phaseTimer / this.countdownStepDuration);
            if (step === 0) {
                this.countdownValue = 3;
                if (this.lastTickedStep !== 0) {
                    this.sound?.playCountdownTick(false);
                    this.lastTickedStep = 0;
                }
            }
            else if (step === 1) {
                this.countdownValue = 2;
                if (this.lastTickedStep !== 1) {
                    this.sound?.playCountdownTick(false);
                    this.lastTickedStep = 1;
                }
            }
            else if (step === 2) {
                this.countdownValue = 1;
                if (this.lastTickedStep !== 2) {
                    this.sound?.playCountdownTick(false);
                    this.lastTickedStep = 2;
                }
            }
            else if (step === 3) {
                this.countdownValue = 0; // "¡DESPEGUE!" / "LAUNCH!"
                if (this.lastTickedStep !== 3) {
                    this.sound?.playCountdownTick(true);
                    this.lastTickedStep = 3;
                }
                // Detección de Launch Boost: toques justos al salir ¡GO!
                if (isActionJustPressed && !this.launchBoostAwarded) {
                    this.launchBoostAwarded = true;
                    launchBoost = true;
                    if (this.currentLevel?.weatherType === "green_smog") {
                        this.setBanner("SUPER BOOST!", "+15% INITIAL MOMENTUM", 1.8);
                    }
                    else {
                        this.setBanner("¡SUPER DESPEGUE!", "+15% IMPULSO INICIAL", 1.8);
                    }
                }
            }
            else {
                // Conteo terminado -> Entrar a carrera activa inmediatamente
                this.phase = "RACING";
                this.phaseTimer = 0;
                if (this.currentLevel?.weatherType === "green_smog") {
                    this.setBanner("ACT 1: TOXIC WIND", "KEEP JUMPS LOW! HIGH JUMPS HIT THE SMOG!", 2.6);
                }
                else {
                    this.setBanner("ACTO 1: ¡DESPEGUE!", "¡ACUMULA MOMENTUM!", 2.2);
                }
                canCountDownTime = true;
                weatherIntensity = 0.75;
            }
        }
        // 3. FASE: RACING (Medio en 3 Actos continuo por porcentaje)
        else if (this.phase === "RACING") {
            canCountDownTime = true;
            // Acto 1 (0% a 35% de la carrera)
            if (progressRatio < 0.35) {
                this.currentAct = 1;
                weatherIntensity = 0.75;
            }
            // Acto 2 (35% a 70% de la carrera - Nudo: Turbulencia cósmica)
            else if (progressRatio < 0.70) {
                if (this.currentAct !== 2) {
                    this.currentAct = 2;
                    this.sound?.playActAlert();
                    if (this.currentLevel?.weatherType === "green_smog") {
                        this.setBanner("ACT 2: DENSE TOXIC CLOUDS", "WATCH OUT! KEEP JUMPING LOW OVER CRATERS", 2.6);
                    }
                    else {
                        this.setBanner("ACTO 2: ¡TURBULENCIA CÓSMICA!", "¡CLIMA INTENSIFICADO! CUIDADO CON OBSTÁCULOS", 2.6);
                    }
                }
                weatherIntensity = 1.25;
            }
            // Acto 3 (70% a 100% de la carrera - Clímax: Recta final y meta Warp)
            else {
                if (this.currentAct !== 3) {
                    this.currentAct = 3;
                    this.sound?.playActAlert();
                    if (this.currentLevel?.weatherType === "green_smog") {
                        this.setBanner("ACT 3: FINAL WARP RUN", "WARP GATE IN SIGHT! FULL POWER TO FINISH!", 2.8);
                    }
                    else {
                        this.setBanner("ACTO 3: ¡RECTA FINAL!", "¡PORTAL WARP A LA VISTA! ¡MÁXIMO MOMENTUM!", 2.8);
                    }
                }
                weatherIntensity = 1.5;
            }
        }
        // 4. FASE: OUTRO FINISHING (Desenlace Épico al cruzar el Warp Gate)
        else if (this.phase === "OUTRO_FINISHING") {
            this.outroTimer += dt;
            if (this.outroTimer >= this.outroDuration) {
                this.phase = "OUTRO_SUMMARY";
                transitionToSummary = true;
            }
        }
        // 5. FASE: INTERLUDE (Hipersalto interplanetario entre mundos)
        else if (this.phase === "INTERLUDE") {
            this.interludeTimer += dt;
            if (this.interludeTimer >= this.interludeDuration) {
                transitionToNextLevel = true;
            }
        }
        return {
            canCountDownTime,
            weatherIntensity,
            launchBoost,
            transitionToSummary,
            transitionToNextLevel
        };
    }
    /**
     * Dispara el desenlace cinemático al cruzar el Warp Gate
     */
    triggerFinish(timeRemaining, maxTime) {
        if (this.phase === "OUTRO_FINISHING" || this.phase === "OUTRO_SUMMARY")
            return;
        this.phase = "OUTRO_FINISHING";
        this.outroTimer = 0;
        // Calcular estrellas ganadas (1 a 3)
        const ratio = timeRemaining / Math.max(1, maxTime);
        if (ratio >= 0.35) {
            this.starsEarned = 3;
        }
        else if (ratio >= 0.15) {
            this.starsEarned = 2;
        }
        else {
            this.starsEarned = 1;
        }
        this.sound?.playGatePass();
        this.sound?.playLevelComplete();
        if (this.currentLevel?.weatherType === "green_smog") {
            this.setBanner("MISSION COMPLETE!", `${"⭐".repeat(this.starsEarned)} RECORD TIME: ${timeRemaining.toFixed(1)}s`, 2.8);
        }
        else {
            this.setBanner("¡MISIÓN CUMPLIDA!", `${"⭐".repeat(this.starsEarned)} TIEMPO RÉCORD: ${timeRemaining.toFixed(1)}s`, 2.8);
        }
    }
    /**
     * Inicia el hipersalto hacia el siguiente capítulo
     */
    triggerInterlude(nextLevel) {
        this.phase = "INTERLUDE";
        this.nextLevelTarget = nextLevel;
        this.interludeTimer = 0;
    }
    /**
     * Renderizado de overlays narrativos (Briefing, Conteo, Banners de Acto y Desenlace)
     */
    render(ctx, width, height) {
        const centerX = width / 2;
        // A) BANNER FLOTANTE DE ACTO O MISIÓN (Estilo Trapecio Deportivo Arcade)
        if (this.bannerTimer > 0 && (this.phase === "RACING" || this.phase === "OUTRO_FINISHING")) {
            const alpha = Math.min(1.0, this.bannerTimer * 2.2);
            ctx.save();
            ctx.globalAlpha = alpha;
            const boxW = width - 36;
            const boxH = 48;
            const boxY = 84;
            const actStroke = this.currentAct === 3 ? "#f43f5e" : this.currentAct === 2 ? "#f59e0b" : "#00e5ff";
            const actFill = this.currentAct === 3 ? ["#ffffff", "#f43f5e"] : this.currentAct === 2 ? ["#ffffff", "#fbbf24"] : ["#ffffff", "#00e5ff"];
            drawChamferPanel(ctx, centerX - boxW / 2, boxY, boxW, boxH, 8, {
                strokeColor: actStroke,
                glowColor: actStroke,
                glowBlur: 12
            });
            drawArcadeText(ctx, this.bannerText, centerX, boxY + 17, {
                size: 13,
                fill: actFill,
                strokeWidth: 3,
                glowColor: actStroke,
                glowBlur: 8
            });
            drawArcadeText(ctx, this.bannerSub, centerX, boxY + 33, {
                size: 10,
                family: ARCADE_FONTS.HUD,
                italic: false,
                fill: "#e2e8f0",
                strokeWidth: 2,
                shadowY: 1
            });
            ctx.restore();
        }
        // B) BRIEFING DE CAPÍTULO INICIAL (Panel de Telemetría Táctica o Tutorial Animado)
        if (this.phase === "INTRO_BRIEFING") {
            ctx.save();
            ctx.fillStyle = "rgba(1, 4, 14, 0.82)";
            ctx.fillRect(0, 0, width, height);
            const isLevel12Tutorial = this.currentLevel?.levelCode === "1-2";
            // B.1) TUTORIAL ANIMADO TÁCTICO EXCLUSIVO PARA EL NIVEL 2 (1-2: TOXIC WIND)
            if (isLevel12Tutorial) {
                const cardW = width - 28;
                const cardH = 280;
                const cardY = height * 0.16;
                drawChamferPanel(ctx, centerX - cardW / 2, cardY, cardW, cardH, 12, {
                    strokeColor: "#4ade80",
                    glowColor: "rgba(74, 222, 128, 0.65)",
                    glowBlur: 18,
                    drawBrackets: true
                });
                drawArcadeText(ctx, "// TACTICAL HAZARD TUTORIAL //", centerX, cardY + 20, {
                    size: 10,
                    family: ARCADE_FONTS.HUD,
                    fill: "#4ade80",
                    strokeWidth: 2
                });
                drawArcadeText(ctx, "⚠️ 1-2: TOXIC WIND DETECTED", centerX, cardY + 40, {
                    size: 15,
                    fill: ["#ffffff", "#4ade80"],
                    strokeWidth: 3.5,
                    glowColor: "#4ade80",
                    glowBlur: 12
                });
                // Ventana de demostración animada en tiempo real
                const demoW = cardW - 28;
                const demoH = 105;
                const demoX = centerX - demoW / 2;
                const demoY = cardY + 56;
                ctx.save();
                ctx.fillStyle = "#020f09";
                ctx.strokeStyle = "#15803d";
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.rect(demoX, demoY, demoW, demoH);
                ctx.fill();
                ctx.stroke();
                ctx.clip();
                // Techo de Smog Tóxico animado (representando altitud >= 80px)
                const smogCeilingY = demoY + 36;
                const smogGrad = ctx.createLinearGradient(0, demoY, 0, smogCeilingY);
                smogGrad.addColorStop(0, "rgba(20, 83, 45, 0.90)");
                smogGrad.addColorStop(0.65, "rgba(74, 222, 128, 0.45)");
                smogGrad.addColorStop(1, "rgba(163, 230, 53, 0.10)");
                ctx.fillStyle = smogGrad;
                ctx.fillRect(demoX, demoY, demoW, 36);
                const timeNow = performance.now() * 0.002;
                ctx.fillStyle = "rgba(74, 222, 128, 0.45)";
                for (let i = 0; i < 6; i++) {
                    const puffX = demoX + (((i * 55 + timeNow * 35) % (demoW + 50)) - 25);
                    const puffY = demoY + 18 + Math.sin(timeNow * 2 + i) * 5;
                    ctx.beginPath();
                    ctx.arc(puffX, puffY, 20, 0, Math.PI * 2);
                    ctx.fill();
                }
                // Línea límite de smog
                ctx.strokeStyle = "#eab308";
                ctx.lineWidth = 1;
                ctx.setLineDash([4, 4]);
                ctx.beginPath();
                ctx.moveTo(demoX, smogCeilingY);
                ctx.lineTo(demoX + demoW, smogCeilingY);
                ctx.stroke();
                ctx.setLineDash([]);
                ctx.fillStyle = "#fef08a";
                ctx.font = "bold 7.5px monospace";
                ctx.textAlign = "left";
                ctx.fillText("▲ TOXIC SMOG (ALT > 80px: -46% SLOWDOWN)", demoX + 6, demoY + 12);
                // Suelo / línea de tierra
                const groundY = demoY + 92;
                ctx.strokeStyle = "#334155";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(demoX, groundY);
                ctx.lineTo(demoX + demoW, groundY);
                ctx.stroke();
                ctx.fillStyle = "#4ade80";
                ctx.font = "bold 7.5px monospace";
                ctx.fillText("▼ CLEAN AIR (0 - 80px: 100% SPEED)", demoX + 6, smogCeilingY + 12);
                // Bucle animado del conejo miniatura (periodo 2.8s)
                const cycle = (performance.now() * 0.001) % 2.8;
                if (cycle < 1.4) {
                    // Fase 1: Salto Rasante (Low Jump)
                    const t = cycle / 1.4;
                    const jumpStartX = demoX + 26;
                    const jumpDist = demoW * 0.42;
                    const bunnyX = jumpStartX + t * jumpDist;
                    const jumpH = Math.sin(t * Math.PI) * 28;
                    const bunnyY = groundY - jumpH;
                    // Parábola verde
                    ctx.strokeStyle = "rgba(74, 222, 128, 0.75)";
                    ctx.lineWidth = 1.2;
                    ctx.beginPath();
                    for (let st = 0; st <= t; st += 0.05) {
                        const px = jumpStartX + st * jumpDist;
                        const py = groundY - Math.sin(st * Math.PI) * 28;
                        if (st === 0)
                            ctx.moveTo(px, py);
                        else
                            ctx.lineTo(px, py);
                    }
                    ctx.stroke();
                    // Silueta conejo
                    ctx.fillStyle = "#ffffff";
                    ctx.beginPath();
                    ctx.ellipse(bunnyX, bunnyY - 5, 5, 7, 0.1, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = "#fbcfe8";
                    ctx.fillRect(bunnyX - 3, bunnyY - 14, 2, 6);
                    ctx.fillRect(bunnyX + 1, bunnyY - 14, 2, 6);
                    ctx.fillStyle = "#4ade80";
                    ctx.font = "bold 8px system-ui";
                    ctx.textAlign = "center";
                    ctx.fillText("✓ SHORT TAP = LOW JUMP", jumpStartX + jumpDist / 2, groundY - 34);
                }
                else {
                    // Fase 2: Slide Dash bajo la Viga Elevada
                    const t = (cycle - 1.4) / 1.4;
                    const slideStartX = demoX + demoW * 0.46;
                    const slideDist = demoW * 0.48;
                    const bunnyX = slideStartX + t * slideDist;
                    const beamX = slideStartX + slideDist * 0.52;
                    // Viga elevada
                    ctx.fillStyle = "#475569";
                    ctx.fillRect(beamX - 3, groundY - 26, 6, 26);
                    ctx.fillStyle = "#f43f5e";
                    ctx.shadowColor = "#f43f5e";
                    ctx.shadowBlur = 6;
                    ctx.fillRect(beamX - 8, groundY - 22, 16, 6);
                    ctx.fillStyle = "#ffffff";
                    ctx.fillRect(beamX - 6, groundY - 20, 12, 2);
                    ctx.shadowBlur = 0;
                    // Silueta conejo deslizándose
                    ctx.fillStyle = "#ffffff";
                    ctx.beginPath();
                    ctx.ellipse(bunnyX, groundY - 3.5, 9, 3.5, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = "rgba(56, 189, 248, 0.65)";
                    ctx.fillRect(bunnyX - 14, groundY - 4, 10, 2);
                    ctx.fillStyle = "#38bdf8";
                    ctx.font = "bold 8px system-ui";
                    ctx.textAlign = "center";
                    ctx.fillText("✓ SLIDE DASH UNDER BEAMS", slideStartX + slideDist / 2, groundY - 32);
                }
                ctx.restore();
                // 3. Instrucciones tácticas
                drawArcadeText(ctx, "• TOQUE CORTO -> SALTO RASANTE (< 80px) EN AIRE LIMPIO", centerX, cardY + 180, {
                    size: 9.5,
                    family: ARCADE_FONTS.HUD,
                    fill: "#bbf7d0",
                    strokeWidth: 2
                });
                drawArcadeText(ctx, "• DESLIZA ABAJO -> SLIDE DASH BAJO VIGAS LÁSER", centerX, cardY + 201, {
                    size: 9.5,
                    family: ARCADE_FONTS.HUD,
                    fill: "#38bdf8",
                    strokeWidth: 2
                });
                drawArcadeText(ctx, "• EVITA FLOTAR ALTO -> EL SMOG FRENA TU TIEMPO", centerX, cardY + 222, {
                    size: 9.5,
                    family: ARCADE_FONTS.HUD,
                    fill: "#fde047",
                    strokeWidth: 2
                });
                // 4. Botón táctico
                const pulse = 0.8 + Math.sin(performance.now() * 0.008) * 0.2;
                drawArcadeText(ctx, "⚡ [ TOCA PARA INICIAR ] ⚡", centerX, cardY + 254, {
                    size: 11,
                    fill: ["#ffffff", "#4ade80"],
                    strokeWidth: 3,
                    glowColor: `rgba(74, 222, 128, ${pulse})`,
                    glowBlur: 10
                });
                ctx.restore();
            }
            else {
                // B.2) PANEL ESTÁNDAR PARA OTROS NIVELES / CAPÍTULOS
                const isHardcore = (this.currentLevel?.levelNumber || 0) >= 17;
                const cardW = width - 36;
                const cardH = 142;
                const cardY = height * 0.30;
                const headerColor = isHardcore ? "#f43f5e" : "#38bdf8";
                const borderColor = isHardcore ? "#f43f5e" : "#00e5ff";
                const borderGlow = isHardcore ? "rgba(244, 63, 94, 0.75)" : "rgba(0, 229, 255, 0.6)";
                drawChamferPanel(ctx, centerX - cardW / 2, cardY, cardW, cardH, 12, {
                    strokeColor: borderColor,
                    glowColor: borderGlow,
                    glowBlur: isHardcore ? 22 : 18,
                    drawBrackets: true
                });
                const headerTitle = isHardcore ? "// ☠️ ALERTA DE DIFICULTAD EXTREMA //" : "// TELEMETRÍA DE MISIÓN //";
                drawArcadeText(ctx, headerTitle, centerX, cardY + 24, {
                    size: 10,
                    family: ARCADE_FONTS.HUD,
                    fill: headerColor,
                    strokeWidth: 2
                });
                drawArcadeText(ctx, this.bannerText, centerX, cardY + 54, {
                    size: isHardcore ? 15 : 17,
                    fill: isHardcore ? ["#ffffff", "#f43f5e"] : ["#ffffff", "#00e5ff"],
                    strokeWidth: 4,
                    glowColor: borderColor,
                    glowBlur: 14
                });
                drawArcadeText(ctx, this.bannerSub, centerX, cardY + 82, {
                    size: 10.5,
                    family: ARCADE_FONTS.HUD,
                    fill: isHardcore ? "#fecdd3" : "#a5f3fc",
                    strokeWidth: 2
                });
                const footerText = isHardcore ? "☠️ REFLEJOS CRÍTICOS REQUERIDOS..." : "⚡ ENERGIZANDO PROPULSORES...";
                const footerFill = isHardcore ? ["#f87171", "#ef4444"] : ["#34d399", "#10b981"];
                drawArcadeText(ctx, footerText, centerX, cardY + 114, {
                    size: 10,
                    fill: footerFill,
                    strokeWidth: 3,
                    glowColor: isHardcore ? "rgba(239, 68, 68, 0.8)" : "rgba(16, 185, 129, 0.8)",
                    glowBlur: 10
                });
                ctx.restore();
            }
        }
        // C) CONTEO 3... 2... 1... ¡DESPEGUE! (Letras Gigantes 3D de Videojuego)
        if (this.phase === "INTRO_COUNTDOWN") {
            ctx.save();
            const pulse = 1.0 + Math.sin(this.phaseTimer * 12) * 0.08;
            ctx.translate(centerX, height * 0.38);
            ctx.scale(pulse, pulse);
            if (this.countdownValue > 0) {
                drawArcadeText(ctx, `${this.countdownValue}`, 0, 0, {
                    size: 76,
                    fill: ["#ffffff", "#00e5ff"],
                    strokeColor: "#020816",
                    strokeWidth: 6,
                    shadowY: 6,
                    glowBlur: 26,
                    glowColor: "rgba(0, 229, 255, 0.85)"
                });
                drawArcadeText(ctx, "PREPÁRATE...", 0, 48, {
                    size: 11,
                    family: ARCADE_FONTS.HUD,
                    fill: "#38bdf8",
                    strokeWidth: 2.5
                });
            }
            else {
                drawArcadeText(ctx, "¡DESPEGUE!", 0, 0, {
                    size: 46,
                    fill: ["#fef08a", "#10b981"],
                    strokeColor: "#022c22",
                    strokeWidth: 6,
                    shadowY: 5,
                    glowBlur: 28,
                    glowColor: "rgba(16, 185, 129, 0.9)"
                });
                drawArcadeText(ctx, "¡TOCA AHORA PARA BOOST!", 0, 48, {
                    size: 11,
                    family: ARCADE_FONTS.HUD,
                    fill: "#fde047",
                    strokeWidth: 2.5,
                    glowColor: "#eab308"
                });
            }
            ctx.restore();
        }
        // D) DESENLACE: CRUCE WARP EN PANTALLA
        if (this.phase === "OUTRO_FINISHING") {
            ctx.save();
            const progress = this.outroTimer / this.outroDuration;
            // Resplandor de hiperespacio
            const flashAlpha = Math.max(0, Math.sin(progress * Math.PI) * 0.45);
            ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
            ctx.fillRect(0, 0, width, height);
            drawArcadeText(ctx, "¡MISIÓN COMPLETADA!", centerX, height * 0.36, {
                size: 24,
                fill: ["#ffffff", "#10b981"],
                strokeColor: "#022c22",
                strokeWidth: 5,
                shadowY: 4,
                glowColor: "#10b981",
                glowBlur: 18
            });
            ctx.font = "34px system-ui";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("⭐".repeat(this.starsEarned), centerX, height * 0.44);
            ctx.restore();
        }
        // E) INTERLUDIO HIPERESPACIAL ENTRE MUNDOS
        if (this.phase === "INTERLUDE") {
            ctx.save();
            ctx.fillStyle = "rgba(3, 7, 18, 0.95)";
            ctx.fillRect(0, 0, width, height);
            const targetTitle = this.nextLevelTarget ? this.nextLevelTarget.title : "SIGUIENTE DESTINO";
            drawArcadeText(ctx, "// SALTO HIPERESPACIAL //", centerX, height * 0.43, {
                size: 11,
                family: ARCADE_FONTS.HUD,
                fill: "#38bdf8",
                strokeWidth: 2
            });
            drawArcadeText(ctx, "VIAJANDO HACIA:", centerX, height * 0.48, {
                size: 16,
                fill: "#ffffff",
                strokeWidth: 3
            });
            drawArcadeText(ctx, targetTitle, centerX, height * 0.54, {
                size: 19,
                fill: ["#ffffff", "#10b981"],
                strokeColor: "#022c22",
                strokeWidth: 4,
                glowColor: "#10b981",
                glowBlur: 16
            });
            // Barra de carga de túnel
            const barW = 200;
            const barH = 6;
            const barProgress = Math.min(1.0, this.interludeTimer / this.interludeDuration);
            ctx.fillStyle = "#1e293b";
            ctx.fillRect(centerX - barW / 2, height * 0.59, barW, barH);
            ctx.fillStyle = "#00e5ff";
            ctx.fillRect(centerX - barW / 2, height * 0.59, barW * barProgress, barH);
            ctx.restore();
        }
    }
}
