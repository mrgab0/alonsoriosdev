import { PlayablesBridge } from "./platform/playables.js";
import { StorageManager } from "./platform/storage.js";
import { AdManager } from "./platform/ads.js";
import { GameLoop } from "./core/loop.js";
import { InputManager } from "./core/input.js";
import { Viewport } from "./core/viewport.js";
import { Planet } from "./game/planet.js";
import { AstroBunny } from "./game/entities/bunny.js";
import { ObstacleSpawner } from "./game/spawner.js";
import { LevelSelectModal, GAME_LEVELS } from "./ui/levelSelect.js";
import { SkinsShop } from "./ui/skinsShop.js";
import { MainMenu } from "./ui/mainMenu.js";
import { PauseOverlay } from "./ui/pauseOverlay.js";
import { GameOverModal } from "./ui/gameOverModal.js";
import { DeepSpaceBackground } from "./ui/deepSpaceBg.js";
import { SoundEngine } from "./audio/soundEngine.js";
import { EnvironmentSystem } from "./game/environment.js";
import { ChapterFlowController } from "./game/chapterFlow.js";
import { ARCADE_FONTS, drawArcadeText, drawChamferPanel } from "./ui/arcadeTheme.js";
class AstroBunnyApp {
    canvas;
    ctx;
    bridge;
    storage;
    ads;
    loop;
    input;
    viewport;
    state = "MAIN_MENU";
    mainMenu = new MainMenu();
    skinsShop = new SkinsShop();
    pauseOverlay = new PauseOverlay();
    gameOverModal = new GameOverModal();
    levelSelect = new LevelSelectModal();
    deepSpaceBg = new DeepSpaceBackground();
    sound = SoundEngine.getInstance();
    // Sistema de Monetización y Segunda Oportunidad (v1.1.0)
    hasUsedReviveInCurrentRun = false;
    isRevivePromptActive = false;
    reviveTimer = 0;
    MAX_REVIVE_TIME = 5.0;
    isDoubleCarrotsClaimed = false;
    planet;
    bunny;
    spawner;
    env;
    chapterFlow;
    activeLasers = [];
    currentLevel = GAME_LEVELS[0];
    currentChapterTitle = GAME_LEVELS[0].title;
    totalCarrots = 0;
    runZappedCount = 0;
    // Temporizador Contrarreloj (Time Attack) y Distancia Meta
    timeRemaining = 65.0;
    maxLevelTime = 65.0;
    targetDistance = Math.PI * 6;
    targetLaps = 3;
    runStatusReason = "HEALTH";
    warningPlayedSeconds = new Set();
    // Sistema de Micro-Impacto y Screen Shake
    screenShakeTimer = 0;
    screenShakeIntensity = 0;
    triggerShake(duration = 0.2, intensity = 4.0) {
        this.screenShakeTimer = duration;
        this.screenShakeIntensity = intensity;
    }
    constructor() {
        this.canvas = document.getElementById("game-canvas");
        const context = this.canvas.getContext("2d", { alpha: false });
        if (!context) {
            throw new Error("No se pudo inicializar el contexto 2D del Canvas.");
        }
        this.ctx = context;
        this.bridge = PlayablesBridge.getInstance();
        this.storage = StorageManager.getInstance();
        this.ads = AdManager.getInstance();
        this.input = InputManager.getInstance();
        this.viewport = new Viewport();
        // 1. Planeta en encuadre 'Media Luna' con textura procedimental y parámetros del nivel
        const initialRadius = this.currentLevel.radius || 780;
        this.planet = new Planet({
            x: Viewport.LOGICAL_WIDTH / 2, // 180
            y: 480 + initialRadius,
            radius: initialRadius,
            gravity: this.currentLevel.gravity,
            colorCore: this.currentLevel.colorCore,
            colorSurface: this.currentLevel.colorSurface,
            colorAtmosphere: this.currentLevel.colorAtmosphere,
            colorVeins: this.currentLevel.colorVeins,
            textureType: this.currentLevel.textureType
        });
        // 2. Astro Bunny anclado en posición runner con mayor visibilidad frontal (X ≈ 136px)
        this.bunny = new AstroBunny(AstroBunny.PLAYER_ANCHOR_ANGLE, 0);
        // 3. Sistema de Clima Espacial (Viento solar, meteoros, polvo estelar)
        this.env = new EnvironmentSystem(this.currentLevel.weatherType || "solar_wind");
        // 3.5. Director de Narrativa y Ritmo de Capítulos
        this.chapterFlow = new ChapterFlowController(this.sound);
        // 4. Generador procedimental de obstáculos configurado según el nivel
        this.spawner = new ObstacleSpawner({
            enemyType: this.currentLevel.enemyType,
            enemyFrequency: this.currentLevel.enemyFrequency,
            scarcityMode: this.currentLevel.weatherType === "green_smog",
            levelCode: this.currentLevel.levelCode,
            targetDistance: this.targetDistance
        });
        this.loop = new GameLoop((dt) => this.update(dt), (alpha) => this.render(alpha));
        this.setupViewport();
        this.setupLifecycle();
        this.setupGestureUnlock();
        this.bootstrap();
    }
    setupGestureUnlock() {
        const unlock = () => {
            this.sound.initOnGesture();
        };
        window.addEventListener("pointerdown", unlock, { once: true, passive: true });
        window.addEventListener("keydown", unlock, { once: true, passive: true });
    }
    setupViewport() {
        const handleResize = () => {
            const wrapper = document.getElementById("game-wrapper");
            if (!wrapper)
                return;
            const rect = wrapper.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            this.canvas.width = Math.floor(rect.width * dpr);
            this.canvas.height = Math.floor(rect.height * dpr);
            this.viewport.update(this.canvas.width, this.canvas.height);
        };
        window.addEventListener("resize", handleResize);
        window.addEventListener("orientationchange", handleResize);
        handleResize();
    }
    setupLifecycle() {
        this.bridge.onPause(() => {
            if (this.state === "PLAYING") {
                this.state = "PAUSED";
            }
            this.sound.pause();
            this.loop.pause();
        });
        this.bridge.onResume(() => {
            this.sound.resume();
            this.loop.resume();
        });
        this.bridge.onAudioChange((enabled) => {
            this.sound.setEnabled(enabled);
            this.mainMenu.audioEnabled = enabled;
        });
    }
    async bootstrap() {
        // 1. Inicialización prioritaria del Bridge SDK
        await this.bridge.init();
        this.render(1);
        this.bridge.notifyFirstFrame();
        const data = await this.storage.load();
        this.totalCarrots = data.cosmicCarrots || 0;
        this.bunny.selectedSkin = data.selectedSkin || "classic_rabbit";
        const soundPref = data.soundEnabled ?? true;
        this.mainMenu.audioEnabled = soundPref;
        this.sound.setEnabled(soundPref && this.bridge.isAudioEnabled());
        this.bridge.notifyGameReady();
        this.sound.startBGM("MENU");
        this.loop.start();
    }
    startRun(preserveSpeed = false, speed = 0, energy = 0) {
        this.bunny.altitude = 0;
        this.bunny.radialVelocity = 0;
        this.bunny.angularVelocity = preserveSpeed ? speed : 0;
        this.bunny.health = 100;
        this.bunny.invulnerableTimer = 0;
        this.bunny.healPopupTimer = 0;
        this.bunny.cosmicEnergy = preserveSpeed ? energy : 0;
        this.bunny.laserAmmo = 0;
        this.bunny.carrotsCollected = 0;
        this.bunny.stumbleTimer = 0;
        this.bunny.isSliding = false;
        this.bunny.isCelebrating = false;
        this.activeLasers = [];
        this.runZappedCount = 0;
        // Reset de Power-ups y Monetización (v1.1.0)
        this.hasUsedReviveInCurrentRun = false;
        this.isRevivePromptActive = false;
        this.reviveTimer = 0;
        this.isDoubleCarrotsClaimed = false;
        this.bunny.selectedSkin = this.storage.getData().selectedSkin || "classic_rabbit";
        this.bunny.hasShield = false;
        this.bunny.magnetTimer = 0;
        this.planet.setRadius(this.currentLevel.radius || 780);
        this.targetLaps = this.currentLevel.targetLaps || 2;
        this.targetDistance = this.targetLaps * (Math.PI * 2);
        this.maxLevelTime = this.currentLevel.targetTime || 40.0;
        this.timeRemaining = this.maxLevelTime;
        this.runStatusReason = "HEALTH";
        this.warningPlayedSeconds.clear();
        this.env.setWeather(this.currentLevel.weatherType || "none");
        this.spawner = new ObstacleSpawner({
            enemyType: this.currentLevel.enemyType,
            enemyFrequency: this.currentLevel.enemyFrequency,
            scarcityMode: this.currentLevel.weatherType === "green_smog",
            levelCode: this.currentLevel.levelCode,
            targetDistance: this.targetDistance
        });
        this.chapterFlow.startLevelIntro(this.currentLevel);
        this.sound.startBGM("RACE");
        this.state = "PLAYING";
        this.storage.save({ cosmicCarrots: this.totalCarrots });
        this.bridge.notifyGameplayStart();
    }
    startRevivePrompt(reason) {
        this.runStatusReason = reason;
        this.isRevivePromptActive = true;
        this.reviveTimer = this.MAX_REVIVE_TIME;
        this.sound.playTimeWarning();
    }
    triggerGameOver(reason) {
        this.runStatusReason = reason;
        this.storage.save({ cosmicCarrots: this.totalCarrots });
        this.sound.playGameOver();
        this.state = "GAME_OVER";
        this.bridge.notifyGameplayStop();
        this.ads.showInterstitial();
    }
    update(dt) {
        if (this.screenShakeTimer > 0) {
            this.screenShakeTimer -= dt;
        }
        if (this.input.lastClick || this.input.wasJumpJustPressed() || this.input.wasShootJustPressed() || this.input.wasSlideJustPressed()) {
            this.sound.initOnGesture();
        }
        const logicalClick = this.input.lastClick
            ? this.viewport.screenToLogical(this.input.lastClick.x, this.input.lastClick.y, this.canvas)
            : null;
        const w = Viewport.LOGICAL_WIDTH;
        const h = Viewport.LOGICAL_HEIGHT;
        // A) ESTADO: MENÚ PRINCIPAL MULTICAPA
        if (this.state === "MAIN_MENU") {
            this.deepSpaceBg.update(dt);
            this.planet.rotate(0.08 * dt);
            if (this.skinsShop.isOpen()) {
                this.skinsShop.update(dt);
                if (logicalClick) {
                    const handled = this.skinsShop.handlePointer(logicalClick.x, logicalClick.y, w, h, true);
                    if (handled) {
                        this.sound.playMenuClick();
                        this.totalCarrots = this.storage.getData().cosmicCarrots || 0;
                        this.bunny.selectedSkin = this.storage.getData().selectedSkin || "classic_rabbit";
                    }
                }
                this.input.endFrame();
                return;
            }
            if (logicalClick) {
                const action = this.mainMenu.handleTouch(logicalClick.x, logicalClick.y, w, h);
                if (action !== null || this.mainMenu.subState !== "SPLASH") {
                    this.sound.playMenuClick();
                }
                if (action === "OPEN_SKINS") {
                    this.skinsShop.open();
                }
                else if (action === "START_GAME") {
                    this.levelSelect.open();
                    this.state = "LEVEL_SELECT";
                }
                else if (action === "CONTINUE") {
                    this.startRun();
                }
                else if (action === "TOGGLE_AUDIO") {
                    this.storage.save({ soundEnabled: this.mainMenu.audioEnabled });
                    this.sound.setEnabled(this.mainMenu.audioEnabled);
                }
            }
            this.input.endFrame();
            return;
        }
        // B) ESTADO: SELECTOR DE CAPÍTULOS
        if (this.state === "LEVEL_SELECT") {
            this.deepSpaceBg.update(dt);
            this.planet.rotate(0.08 * dt);
            if (logicalClick) {
                const selected = this.levelSelect.handleTouch(logicalClick.x, logicalClick.y);
                if (selected) {
                    this.sound.playMenuClick();
                    this.currentLevel = selected;
                    this.currentChapterTitle = selected.title;
                    this.planet.colorCore = selected.colorCore;
                    this.planet.colorSurface = selected.colorSurface;
                    this.planet.colorAtmosphere = selected.colorAtmosphere;
                    this.planet.colorVeins = selected.colorVeins;
                    this.planet.textureType = selected.textureType;
                    this.planet.gravity = selected.gravity;
                    this.planet.initProceduralFeatures();
                    // Iniciar la carrera de inmediato en el nivel seleccionado
                    this.startRun();
                }
                else if (!this.levelSelect.isOpen) {
                    this.sound.playMenuClick();
                    this.mainMenu.subState = "HUB";
                    this.state = "MAIN_MENU";
                }
            }
            this.input.endFrame();
            return;
        }
        // C) ESTADO: PAUSA
        if (this.state === "PAUSED") {
            if (logicalClick) {
                const action = this.pauseOverlay.handleTouch(logicalClick.x, logicalClick.y, w);
                if (action) {
                    this.sound.playMenuClick();
                }
                if (action === "RESUME") {
                    this.sound.resume();
                    this.state = "PLAYING";
                }
                else if (action === "RESTART") {
                    this.startRun();
                }
                else if (action === "MENU") {
                    this.sound.startBGM("MENU");
                    this.mainMenu.subState = "HUB";
                    this.state = "MAIN_MENU";
                }
            }
            this.input.endFrame();
            return;
        }
        // D) ESTADO: FIN DE CARRERA (GAME OVER)
        if (this.state === "GAME_OVER") {
            if (logicalClick) {
                const action = this.gameOverModal.handleTouch(logicalClick.x, logicalClick.y, w, false);
                if (action) {
                    this.sound.playMenuClick();
                }
                if (action === "RETRY") {
                    this.startRun();
                }
                else if (action === "MENU") {
                    this.sound.startBGM("MENU");
                    this.mainMenu.subState = "HUB";
                    this.state = "MAIN_MENU";
                }
            }
            this.input.endFrame();
            return;
        }
        // D.2) ESTADO: VICTORIA CONTRARRELOJ (LEVEL COMPLETE)
        if (this.state === "LEVEL_COMPLETE") {
            if (logicalClick) {
                // Botón Duplicar Zanahorias Recompensado (v1.1.0)
                if (!this.isDoubleCarrotsClaimed && this.bunny.carrotsCollected > 0) {
                    const btnW = 210;
                    const btnH = 34;
                    const btnX = (w - btnW) / 2;
                    const btnY = h * 0.44;
                    if (logicalClick.x >= btnX &&
                        logicalClick.x <= btnX + btnW &&
                        logicalClick.y >= btnY &&
                        logicalClick.y <= btnY + btnH) {
                        this.sound.playMenuClick();
                        this.ads.showRewarded("double_carrots").then((rewarded) => {
                            if (rewarded && !this.isDoubleCarrotsClaimed) {
                                this.isDoubleCarrotsClaimed = true;
                                const bonus = this.bunny.carrotsCollected;
                                this.totalCarrots += bonus;
                                this.bunny.carrotsCollected *= 2;
                                this.storage.save({ cosmicCarrots: this.totalCarrots });
                                this.sound.playCarrot();
                            }
                        });
                        this.input.endFrame();
                        return;
                    }
                }
                const action = this.gameOverModal.handleTouch(logicalClick.x, logicalClick.y, w, true);
                if (action) {
                    this.sound.playMenuClick();
                }
                if (action === "NEXT_LEVEL") {
                    const currentIndex = GAME_LEVELS.findIndex((l) => l.id === this.currentLevel.id);
                    const nextIndex = (currentIndex + 1) % GAME_LEVELS.length;
                    const nextLvl = GAME_LEVELS[nextIndex];
                    // Capturar velocidad y energía remanente para encadenar capítulos dinámicamente
                    const remnantSpeed = Math.max(0.35, this.bunny.angularVelocity);
                    const remnantEnergy = this.bunny.cosmicEnergy;
                    this.currentLevel = nextLvl;
                    this.currentChapterTitle = nextLvl.title;
                    this.planet.colorCore = nextLvl.colorCore;
                    this.planet.colorSurface = nextLvl.colorSurface;
                    this.planet.colorAtmosphere = nextLvl.colorAtmosphere;
                    this.planet.colorVeins = nextLvl.colorVeins;
                    this.planet.textureType = nextLvl.textureType;
                    this.planet.gravity = nextLvl.gravity;
                    this.planet.setRadius(nextLvl.radius || 780);
                    // Iniciar el nuevo nivel preservando la velocidad remanente
                    this.startRun(true, remnantSpeed, remnantEnergy);
                    this.input.endFrame();
                    return;
                }
                else if (action === "RETRY") {
                    this.startRun();
                }
                else if (action === "MENU") {
                    this.sound.startBGM("MENU");
                    this.mainMenu.subState = "HUB";
                    this.state = "MAIN_MENU";
                }
            }
            this.input.endFrame();
            return;
        }
        // E) ESTADO: PLAYING (Partida Activa)
        // 0. Modal de Segunda Oportunidad / Revive activo (v1.1.0)
        if (this.isRevivePromptActive) {
            this.reviveTimer -= dt;
            if (this.reviveTimer <= 0) {
                this.isRevivePromptActive = false;
                this.triggerGameOver(this.runStatusReason === "TIMEOUT" ? "TIMEOUT" : "HEALTH");
                this.input.endFrame();
                return;
            }
            if (logicalClick) {
                const modalH = 240;
                const modalY = (h - modalH) / 2;
                const btnW = 220;
                const btnH = 42;
                const btnX = (w - btnW) / 2;
                const btnY = modalY + 130;
                // Clic en [ 🎬 REVIVIR CON ESCUDO ]
                if (logicalClick.x >= btnX &&
                    logicalClick.x <= btnX + btnW &&
                    logicalClick.y >= btnY &&
                    logicalClick.y <= btnY + btnH) {
                    this.sound.playMenuClick();
                    this.isRevivePromptActive = false;
                    this.ads.showRewarded("revive").then((rewarded) => {
                        if (rewarded) {
                            this.hasUsedReviveInCurrentRun = true;
                            this.bunny.health = this.bunny.maxHealth;
                            this.bunny.activateShield();
                            this.bunny.invulnerableTimer = 2.5;
                            this.sound.playWarp();
                            if (this.runStatusReason === "TIMEOUT") {
                                this.timeRemaining = Math.max(15, this.maxLevelTime * 0.4);
                            }
                        }
                        else {
                            this.triggerGameOver(this.runStatusReason === "TIMEOUT" ? "TIMEOUT" : "HEALTH");
                        }
                    });
                    this.input.endFrame();
                    return;
                }
                // Clic en [ No gracias / Saltar ]
                const skipY = btnY + 48;
                if (logicalClick.x >= w / 2 - 80 &&
                    logicalClick.x <= w / 2 + 80 &&
                    logicalClick.y >= skipY &&
                    logicalClick.y <= skipY + 30) {
                    this.sound.playMenuClick();
                    this.isRevivePromptActive = false;
                    this.triggerGameOver(this.runStatusReason === "TIMEOUT" ? "TIMEOUT" : "HEALTH");
                    this.input.endFrame();
                    return;
                }
            }
            this.input.endFrame();
            return;
        }
        // Sincronizar disponibilidad de láser para la zona táctil inteligente
        this.input.setLaserAvailable(this.bunny.laserAmmo > 0);
        // 0. Clic en botón de Pausa o Selector dentro de carrera
        if (logicalClick) {
            if (logicalClick.x >= w - 42 && logicalClick.x <= w - 10 && logicalClick.y >= 10 && logicalClick.y <= 42) {
                this.sound.playMenuClick();
                this.sound.pause();
                this.state = "PAUSED";
                this.input.endFrame();
                return;
            }
            if (logicalClick.x >= 14 && logicalClick.x <= 134 && logicalClick.y >= 54 && logicalClick.y <= 82) {
                this.sound.playMenuClick();
                this.levelSelect.open();
                this.state = "LEVEL_SELECT";
                this.input.endFrame();
                return;
            }
        }
        // 0.4. Actualizar Dirección Narrativa de Capítulos (Briefing, Conteo, 3 Actos, Desenlace)
        const isActionJustPressed = this.input.wasJumpJustPressed() || this.input.wasSlideJustPressed() || this.input.wasShootJustPressed();
        const progressRatio = this.spawner.accumulatedAngle / Math.max(0.001, this.targetDistance);
        const flowResult = this.chapterFlow.update(dt, progressRatio, this.spawner.lap, this.targetLaps, this.timeRemaining, this.maxLevelTime, isActionJustPressed);
        // Si hubo Launch Boost en el despegue ("¡GO!"): impulso inicial moderado
        if (flowResult.launchBoost) {
            this.bunny.angularVelocity = Math.max(0.18, this.bunny.angularVelocity + 0.12);
            this.bunny.cosmicEnergy = Math.min(100, this.bunny.cosmicEnergy + 15);
            this.sound.playWarp();
        }
        // Escalar la intensidad climática según el acto (Acto 1 suave, Acto 2 tormenta, Acto 3 clímax)
        this.env.setIntensity(flowResult.weatherIntensity);
        // Si terminó la secuencia cinemática de outro (OUTRO_FINISHING -> OUTRO_SUMMARY)
        if (flowResult.transitionToSummary) {
            this.runStatusReason = "VICTORY";
            this.storage.save({ cosmicCarrots: this.totalCarrots });
            this.storage.recordLevelCompletion(this.currentLevel.chapterNumber, this.currentLevel.levelNumber, this.chapterFlow.starsEarned);
            this.state = "LEVEL_COMPLETE";
            this.bridge.notifyGameplayStop();
            this.ads.showInterstitial();
            this.input.endFrame();
            return;
        }
        // Si se completó el viaje de hipersalto en interludio
        if (flowResult.transitionToNextLevel && this.chapterFlow.nextLevelTarget) {
            const nextLvl = this.chapterFlow.nextLevelTarget;
            this.currentLevel = nextLvl;
            this.currentChapterTitle = nextLvl.title;
            this.planet.colorCore = nextLvl.colorCore;
            this.planet.colorSurface = nextLvl.colorSurface;
            this.planet.colorAtmosphere = nextLvl.colorAtmosphere;
            this.planet.colorVeins = nextLvl.colorVeins;
            this.planet.textureType = nextLvl.textureType;
            this.planet.gravity = nextLvl.gravity;
            this.planet.setRadius(nextLvl.radius || 780);
            this.startRun();
            return;
        }
        // 0.5. Cuenta atrás de tiempo Contrarreloj (Solo cuando la carrera está activa)
        if (flowResult.canCountDownTime && this.chapterFlow.phase === "RACING") {
            this.timeRemaining -= dt;
            if (this.timeRemaining <= 10.0 && this.timeRemaining > 0) {
                const secInt = Math.ceil(this.timeRemaining);
                if (!this.warningPlayedSeconds.has(secInt)) {
                    this.warningPlayedSeconds.add(secInt);
                    this.sound.playTimeWarning();
                }
            }
            else if (this.timeRemaining <= 0) {
                this.timeRemaining = 0;
                if (!this.hasUsedReviveInCurrentRun) {
                    this.startRevivePrompt("TIMEOUT");
                    this.input.endFrame();
                    return;
                }
                this.triggerGameOver("TIMEOUT");
                this.input.endFrame();
                return;
            }
        }
        // 0.55. Viento a Favor y Corriente Térmica Pre-Meta (Últimos ~20 metros antes del Warp Gate)
        const isTailwindZone = this.targetDistance > 0 &&
            this.spawner.accumulatedAngle >= this.targetDistance - 0.28 &&
            this.spawner.accumulatedAngle < this.targetDistance;
        if (isTailwindZone) {
            // 1. Aceleración aerodinámica hacia adelante con viento a favor
            this.bunny.angularVelocity = Math.max(0.42, this.bunny.angularVelocity + 0.38 * dt);
            // 2. Dispersar smog o fricción en contra para permitir el vuelo triunfal
            this.env.windResistance = 0;
        }
        // 0.6. Condición de Victoria Contrarreloj: Alcanzar la meta (Warp Gate)
        if (this.spawner.accumulatedAngle >= this.targetDistance) {
            if (this.chapterFlow.phase !== "OUTRO_FINISHING" && this.chapterFlow.phase !== "OUTRO_SUMMARY") {
                this.bunny.isCelebrating = true;
                this.chapterFlow.triggerFinish(this.timeRemaining, this.maxLevelTime);
            }
        }
        // 1. Manejo de Disparo Láser Cóncavo
        if (this.input.wasShootJustPressed()) {
            const laser = this.bunny.shootLaser();
            if (laser) {
                this.activeLasers.push(laser);
                this.sound.playLaser();
            }
        }
        // 1.1. Manejo de Nitro / Turbo Manual (Estilo Asphalt)
        if (this.input.wasTurboJustPressed() && this.bunny.cosmicEnergy > 0) {
            this.sound.playNitro();
            this.triggerShake(0.18, 3.2);
        }
        // 1.2. Sonido de Slide al deslizarse
        if (this.input.wasSlideJustPressed()) {
            this.sound.playSlide();
        }
        // 1.5. Salto y sustentación Hang-Time con sonido (Mega Salto en Viento a Favor)
        if (this.input.wasJumpJustPressed()) {
            if (isTailwindZone) {
                this.bunny.triggerMegaJump(720);
                this.sound.playWarp();
            }
            else if (this.bunny.isGrounded) {
                this.sound.playJump();
            }
            else if (this.bunny.canHang && this.bunny.altitude > 12) {
                this.sound.playHangTime();
            }
        }
        // 2. Actualizar al personaje con detección de transición Warp
        const wasWarp = this.bunny.currentTier === "WARP";
        this.bunny.update(dt, this.planet);
        const isWarpNow = this.bunny.currentTier === "WARP";
        if (!wasWarp && isWarpNow) {
            this.sound.playWarp();
            this.sound.startBGM("WARP");
            this.triggerShake(0.35, 7.0);
        }
        else if (wasWarp && !isWarpNow && this.state === "PLAYING") {
            this.sound.startBGM("RACE");
        }
        // 3. El avance tangencial rota la superficie del planeta bajo el conejo (SOLO SI AVANZA)
        const angularDelta = this.bunny.angularVelocity * dt;
        if (Math.abs(angularDelta) > 0.00001) {
            this.planet.rotate(angularDelta);
        }
        // 4. El generador de obstáculos avanza con la rotación y tiempo
        this.spawner.update(angularDelta, dt);
        // 4.1. Atracción Magnética de Zanahorias (v1.1.0)
        if (this.bunny.magnetTimer > 0) {
            for (const ent of this.spawner.entities) {
                if (ent.collected || ent.type !== "carrot")
                    continue;
                const angleDiff = ent.angle - this.spawner.accumulatedAngle;
                const distArc = Math.abs(angleDiff) * (this.planet.radius + ent.altitude);
                if (distArc < 170) {
                    const pullSpeed = 3.8 * dt;
                    if (angleDiff > 0) {
                        ent.angle = Math.max(this.spawner.accumulatedAngle, ent.angle - pullSpeed);
                    }
                    else {
                        ent.angle = Math.min(this.spawner.accumulatedAngle, ent.angle + pullSpeed);
                    }
                    ent.altitude += (this.bunny.altitude - ent.altitude) * 7.5 * dt;
                }
            }
        }
        // 4.5. Actualizar Clima Espacial (Viento solar, lluvia de meteoros, polvo estelar)
        const envEffect = this.env.update(dt, this.bunny, this.spawner.accumulatedAngle, this.planet);
        if (isTailwindZone) {
            envEffect.dragSlowdown = 0; // El viento a favor anula la resistencia del smog para el vuelo triunfal
        }
        if (envEffect.hitHazard) {
            if (this.bunny.consumeShield()) {
                this.sound.playWarp();
                this.triggerShake(0.20, 4.0);
            }
            else {
                this.bunny.hitHazard();
                this.sound.playHit();
                this.triggerShake(0.28, 5.5);
                if (this.bunny.health <= 0) {
                    if (!this.hasUsedReviveInCurrentRun) {
                        this.startRevivePrompt("HEALTH");
                        this.input.endFrame();
                        return;
                    }
                    this.triggerGameOver("HEALTH");
                    this.input.endFrame();
                    return;
                }
            }
        }
        if (envEffect.dragSlowdown > 0 && this.bunny.angularVelocity > 0) {
            this.bunny.angularVelocity = Math.max(0, this.bunny.angularVelocity - envEffect.dragSlowdown * 1.8 * dt);
        }
        // 5. Actualizar proyectiles láser
        for (let i = this.activeLasers.length - 1; i >= 0; i--) {
            const laser = this.activeLasers[i];
            laser.update(dt);
            if (!laser.active) {
                this.activeLasers.splice(i, 1);
            }
        }
        // 6. Detección de colisiones (con soporte de Slide para low_beam y cápsulas de energía)
        const isWarp = this.bunny.currentTier === "WARP";
        const col = this.spawner.checkCollisions(this.spawner.accumulatedAngle, this.bunny.altitude, isWarp, this.bunny.isSliding, this.activeLasers, this.bunny.angularVelocity, this.bunny.currentTier);
        const isScarcity = this.currentLevel.weatherType === "green_smog";
        if (col.collectedCarrot) {
            this.bunny.collectCarrot(isScarcity ? 8 : 12, isScarcity ? 2.0 : 3.5);
            this.totalCarrots++;
            this.storage.save({ cosmicCarrots: this.totalCarrots });
            this.sound.playCarrot();
        }
        if (col.collectedWeaponPod) {
            this.bunny.addEnergyPod(isScarcity ? 15 : 25);
            this.sound.playCarrot();
        }
        if (col.collectedMagnet) {
            this.bunny.activateMagnet(8.0);
            this.sound.playWarp();
        }
        if (col.collectedShield) {
            this.bunny.activateShield();
            this.sound.playWarp();
        }
        if (col.enemiesZapped > 0) {
            this.runZappedCount += col.enemiesZapped;
            this.bunny.cosmicEnergy = Math.min(this.bunny.maxEnergy, this.bunny.cosmicEnergy + 10 * col.enemiesZapped);
            this.sound.playEnemyZap();
        }
        if (col.enemySlowdown) {
            this.bunny.applyEnemySlowdown();
        }
        if (col.hitBoostPad) {
            this.bunny.hitBoostPad();
            this.sound.playJump();
            this.triggerShake(0.20, 4.0);
        }
        if (col.hitHazard) {
            if (this.bunny.consumeShield()) {
                this.sound.playWarp();
                this.triggerShake(0.20, 4.0);
            }
            else {
                this.bunny.hitHazard();
                this.sound.playHit();
                this.triggerShake(0.28, 5.5);
                if (this.bunny.health <= 0) {
                    if (!this.hasUsedReviveInCurrentRun) {
                        this.startRevivePrompt("HEALTH");
                        this.input.endFrame();
                        return;
                    }
                    this.triggerGameOver("HEALTH");
                    this.input.endFrame();
                    return;
                }
            }
        }
        this.input.endFrame();
    }
    render(_alpha) {
        const ctx = this.ctx;
        // Limpieza total del Canvas
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillStyle = this.bunny.currentTier === "WARP" && this.state === "PLAYING" ? "#02030d" : "#010207";
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        // CRITICAL FIX: Aplicar transformación de escala y centrado para relación de aspecto 9:16
        this.viewport.apply(ctx);
        const w = Viewport.LOGICAL_WIDTH;
        const h = Viewport.LOGICAL_HEIGHT;
        if (this.state === "MAIN_MENU") {
            // Espacio profundo con nebulosas y planetas miniatura orbitando
            this.deepSpaceBg.render(ctx, w, h);
            if (this.skinsShop.isOpen()) {
                this.skinsShop.render(ctx, w, h);
            }
            else {
                this.mainMenu.render(ctx, w, h, this.totalCarrots, this.currentChapterTitle);
            }
        }
        else if (this.state === "LEVEL_SELECT") {
            this.deepSpaceBg.render(ctx, w, h);
            this.levelSelect.render(ctx, w, h);
        }
        else {
            ctx.save();
            if (this.screenShakeTimer > 0) {
                const shakeX = (Math.random() * 2 - 1) * this.screenShakeIntensity;
                const shakeY = (Math.random() * 2 - 1) * this.screenShakeIntensity;
                ctx.translate(shakeX, shakeY);
            }
            // 1. Estrellas con velocidad y paralaje
            this.renderStarfield(ctx, w, h);
            // 2. Renderizado del Planeta (Cresta de Media Luna gigante al jugar)
            this.planet.render(ctx);
            // 2.5. Renderizado del Clima Espacial (Viento solar, polvo estelar, lluvia de meteoros)
            this.env.render(ctx, this.planet, this.spawner.accumulatedAngle);
            // 3. Renderizado de Obstáculos en la superficie rotatoria + Warp Gate en la meta
            this.spawner.render(ctx, this.planet, this.spawner.accumulatedAngle, this.targetDistance);
            // 3.5. Renderizado de Láseres Curvos Cóncavos
            for (const laser of this.activeLasers) {
                laser.render(ctx, this.planet, this.spawner.accumulatedAngle);
            }
            // 4. Renderizado del Astro Bunny en la cresta
            this.bunny.render(ctx, this.planet);
            ctx.restore();
            // 5. HUD adaptado a 9:16
            this.renderHUD(ctx, w, h);
            // 5.5. Overlays de ChapterFlow (Briefing, Conteo 3..2..1, Banners de Actos, Desenlace, Interludio)
            this.chapterFlow.render(ctx, w, h);
            // Overlays contextuales
            if (this.state === "PAUSED") {
                this.pauseOverlay.render(ctx, w, h);
            }
            else if (this.state === "GAME_OVER") {
                this.gameOverModal.render(ctx, w, h, {
                    carrots: this.bunny.carrotsCollected,
                    lap: this.spawner.lap,
                    enemiesZapped: this.runZappedCount,
                    timeRemaining: this.timeRemaining,
                    isVictory: false,
                    reason: this.runStatusReason
                });
            }
            else if (this.state === "LEVEL_COMPLETE") {
                this.gameOverModal.render(ctx, w, h, {
                    carrots: this.bunny.carrotsCollected,
                    lap: this.spawner.lap,
                    enemiesZapped: this.runZappedCount,
                    timeRemaining: this.timeRemaining,
                    isVictory: true,
                    reason: "VICTORY",
                    stars: this.chapterFlow.starsEarned,
                    chapterTitle: this.currentLevel.title
                });
                // Botón Recompensado: Duplicar Zanahorias (v1.1.0)
                if (!this.isDoubleCarrotsClaimed && this.bunny.carrotsCollected > 0) {
                    const btnW = 210;
                    const btnH = 34;
                    const btnX = (w - btnW) / 2;
                    const btnY = h * 0.44;
                    ctx.save();
                    const pulse = Math.sin(performance.now() * 0.008) * 0.15 + 0.85;
                    ctx.fillStyle = `rgba(245, 158, 11, ${pulse * 0.3})`;
                    ctx.strokeStyle = "#fbbf24";
                    ctx.lineWidth = 1.8;
                    ctx.shadowColor = "#f59e0b";
                    ctx.shadowBlur = 12;
                    ctx.beginPath();
                    ctx.roundRect(btnX, btnY, btnW, btnH, 10);
                    ctx.fill();
                    ctx.stroke();
                    ctx.textAlign = "center";
                    ctx.fillStyle = "#ffffff";
                    ctx.font = "bold 11px system-ui, sans-serif";
                    const doublePrefix = this.ads.isRewardedSupported() ? "🎬" : "⚡";
                    ctx.fillText(`${doublePrefix} DUPLICAR (🥕 +${this.bunny.carrotsCollected})`, btnX + btnW / 2, btnY + 21);
                    ctx.restore();
                }
            }
            // Modal de Segunda Oportunidad / Revive sobre la partida activa
            if (this.isRevivePromptActive) {
                this.renderReviveModal(ctx, w, h);
            }
        }
        this.viewport.restore(ctx);
    }
    renderReviveModal(ctx, width, height) {
        ctx.save();
        ctx.fillStyle = "rgba(5, 8, 20, 0.85)";
        ctx.fillRect(0, 0, width, height);
        const modalW = Math.min(width - 36, 310);
        const modalH = 240;
        const modalX = (width - modalW) / 2;
        const modalY = (height - modalH) / 2;
        // Marco exterior chamfered
        ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
        ctx.strokeStyle = "#fbbf24";
        ctx.lineWidth = 2;
        ctx.shadowColor = "#f59e0b";
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.roundRect(modalX, modalY, modalW, modalH, 16);
        ctx.fill();
        ctx.stroke();
        // Título
        ctx.shadowBlur = 0;
        ctx.textAlign = "center";
        ctx.fillStyle = "#fbbf24";
        ctx.font = "bold 15px system-ui, sans-serif";
        ctx.fillText("¿SEGUNDA OPORTUNIDAD?", width / 2, modalY + 36);
        // Círculo de cuenta regresiva
        const timerX = width / 2;
        const timerY = modalY + 85;
        const timerRadius = 26;
        const progress = this.reviveTimer / this.MAX_REVIVE_TIME;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(timerX, timerY, timerRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = "#10b981";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(timerX, timerY, timerRadius, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2, false);
        ctx.stroke();
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 18px monospace";
        ctx.fillText(`${Math.ceil(this.reviveTimer)}`, timerX, timerY + 6);
        // Botón Revivir
        const btnW = 220;
        const btnH = 42;
        const btnX = (width - btnW) / 2;
        const btnY = modalY + 130;
        const btnGrad = ctx.createLinearGradient(btnX, btnY, btnX + btnW, btnY + btnH);
        btnGrad.addColorStop(0, "#10b981");
        btnGrad.addColorStop(1, "#059669");
        ctx.fillStyle = btnGrad;
        ctx.shadowColor = "#34d399";
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.roundRect(btnX, btnY, btnW, btnH, 12);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 13px system-ui, sans-serif";
        const revivePrefix = this.ads.isRewardedSupported() ? "🎬" : "⚡";
        ctx.fillText(`${revivePrefix} REVIVIR CON ESCUDO`, width / 2, btnY + 26);
        // Botón Saltar
        const skipBtnY = btnY + 54;
        ctx.fillStyle = "#94a3b8";
        ctx.font = "11px system-ui, sans-serif";
        ctx.fillText("No gracias, terminar carrera", width / 2, skipBtnY + 12);
        ctx.restore();
    }
    renderStarfield(ctx, width, height) {
        const isWarp = this.bunny.currentTier === "WARP" && this.state === "PLAYING";
        const isTurbo = this.bunny.isManualNitro && this.state === "PLAYING";
        const isHighSpeed = this.bunny.angularVelocity > 0.48 && this.state === "PLAYING";
        const hasStreaks = isWarp || isTurbo || isHighSpeed;
        const speedMultiplier = isWarp ? 14 : isTurbo ? 7.5 : isHighSpeed ? 5.2 : 3.0;
        const speedX = this.state === "PLAYING" ? (-this.bunny.angularVelocity * speedMultiplier) : -0.4;
        ctx.save();
        ctx.fillStyle = isWarp ? "rgba(0, 229, 255, 0.9)" : "rgba(255, 255, 255, 0.75)";
        for (let i = 0; i < 42; i++) {
            const baseX = (i * 87.3) % width;
            const y = (i * 123.7) % (height * 0.72);
            const x = (baseX + performance.now() * 0.04 * speedX) % width;
            const finalX = x < 0 ? width + x : x;
            if (hasStreaks) {
                ctx.strokeStyle = isWarp
                    ? "rgba(0, 255, 255, 0.75)"
                    : isTurbo
                        ? "rgba(56, 189, 248, 0.70)"
                        : "rgba(255, 255, 255, 0.45)";
                ctx.lineWidth = isWarp ? 1.8 : isTurbo ? 1.5 : 1.1;
                ctx.beginPath();
                ctx.moveTo(finalX, y);
                const streakLen = isWarp ? 6.0 : isTurbo ? 4.5 : 3.0;
                ctx.lineTo(finalX - speedX * streakLen, y);
                ctx.stroke();
            }
            else {
                const size = (i % 3 === 0) ? 2 : 1.2;
                ctx.fillRect(finalX, y, size, size);
            }
        }
        ctx.restore();
    }
    renderHUD(ctx, width, height) {
        ctx.save();
        // 1. Barra superior: Zanahorias (🥕) a la izquierda con acabado deportivo
        drawArcadeText(ctx, `🥕 ${this.bunny.carrotsCollected}`, 16, 20, {
            size: 13,
            family: ARCADE_FONTS.HUD,
            align: "left",
            baseline: "middle",
            fill: ["#ffffff", "#fef08a"],
            strokeWidth: 3,
            glowColor: "rgba(251, 191, 36, 0.4)",
            glowBlur: 6,
        });
        // 1.1. Reloj Digital Contrarreloj (Time Attack)
        const isCriticalTime = this.timeRemaining <= 10.0;
        const clockText = isCriticalTime ? `⚠️ ⏱️ ${this.timeRemaining.toFixed(1)}s` : `⏱️ ${this.timeRemaining.toFixed(1)}s`;
        drawArcadeText(ctx, clockText, width / 2, 20, {
            size: 14,
            family: ARCADE_FONTS.DIGITAL,
            align: "center",
            baseline: "middle",
            fill: isCriticalTime ? ["#ffffff", "#ef4444"] : ["#ffffff", "#38bdf8"],
            strokeWidth: 3.5,
            glowColor: isCriticalTime ? "#ef4444" : "#00e5ff",
            glowBlur: isCriticalTime ? 12 : 6,
        });
        // 1.2. Meta de distancia / Vueltas
        const progressPercent = Math.min(100, Math.floor((this.spawner.accumulatedAngle / this.targetDistance) * 100));
        drawArcadeText(ctx, `🏁 ${progressPercent}%`, width - 46, 20, {
            size: 12,
            family: ARCADE_FONTS.HUD,
            align: "right",
            baseline: "middle",
            fill: ["#ffffff", "#4ade80"],
            strokeWidth: 3,
            glowColor: "rgba(74, 222, 128, 0.4)",
            glowBlur: 6,
        });
        // 1.3. Botón de Pausa [ ⏸ ] Biselado
        drawChamferPanel(ctx, width - 38, 8, 26, 25, 5, {
            fillColor: "rgba(15, 23, 42, 0.8)",
            strokeColor: "rgba(255, 255, 255, 0.45)",
            lineWidth: 1.5,
            drawBrackets: false,
            glowBlur: 0,
        });
        drawArcadeText(ctx, "⏸", width - 25, 20, {
            size: 11,
            family: ARCADE_FONTS.HUD,
            align: "center",
            baseline: "middle",
            fill: "#ffffff",
            strokeWidth: 2,
            glowBlur: 0,
        });
        // 2. Doble Barra: Salud (❤️ HP) y Momentum / Turbo (⚡ TURBO)
        this.renderHealthAndEnergyBars(ctx, 16, 31);
        // 3. Badge Central de Propulsor
        this.renderThrusterBadge(ctx, width / 2, 42);
        // 4. Velocímetro (Discreto a la derecha)
        const speedKmh = Math.floor(Math.abs(this.bunny.angularVelocity) * 220);
        drawArcadeText(ctx, `${speedKmh} KM/H`, width - 16, 44, {
            size: 10,
            family: ARCADE_FONTS.DIGITAL,
            align: "right",
            baseline: "middle",
            fill: ["#ffffff", "#38bdf8"],
            strokeWidth: 2,
            glowColor: "rgba(56, 189, 248, 0.4)",
            glowBlur: 4,
        });
        // 5. Insignia de Capítulo / Nivel (Interactiva para abrir selector)
        drawChamferPanel(ctx, 14, 56, 126, 22, 5, {
            fillColor: "rgba(7, 14, 32, 0.85)",
            strokeColor: "#00e5ff",
            lineWidth: 1.5,
            glowColor: "rgba(0, 229, 255, 0.4)",
            glowBlur: 6,
            drawBrackets: false,
        });
        drawArcadeText(ctx, `🪐 ${this.currentChapterTitle}`, 77, 67, {
            size: 9,
            family: ARCADE_FONTS.HUD,
            align: "center",
            baseline: "middle",
            fill: ["#ffffff", "#00e5ff"],
            strokeWidth: 2,
            glowColor: "#00e5ff",
            glowBlur: 4,
        });
        // 6. Insignia de Clima Espacial o Radar de Meta en Acto 3
        if (this.chapterFlow.currentAct === 3) {
            const remainingM = this.spawner.getRemainingMeters(this.targetDistance);
            drawArcadeText(ctx, `🏁 META: ${remainingM}m`, width - 16, 67, {
                size: 10,
                family: ARCADE_FONTS.HUD,
                align: "right",
                baseline: "middle",
                fill: ["#ffffff", "#34d399"],
                strokeWidth: 2.5,
                glowColor: "rgba(52, 211, 153, 0.5)",
                glowBlur: 6,
            });
        }
        else {
            let weatherBadge = "☀️ Despejado";
            let weatherFill = ["#ffffff", "#facc15"];
            let weatherGlow = "rgba(250, 204, 21, 0.4)";
            if (this.env.weather === "solar_wind") {
                weatherBadge = "💨 Viento Solar";
            }
            else if (this.env.weather === "green_smog") {
                const isDragging = this.bunny.altitude >= 60;
                if (isDragging) {
                    weatherBadge = Math.floor(Date.now() / 200) % 2 === 0 ? "⚠️ SMOG DRAG!" : "☣️ TOXIC SMOG";
                    weatherFill = ["#ffffff", "#ef4444"];
                    weatherGlow = "rgba(239, 68, 68, 0.8)";
                }
                else {
                    weatherBadge = "☣️ TOXIC SMOG";
                    weatherFill = ["#ffffff", "#4ade80"];
                    weatherGlow = "rgba(74, 222, 128, 0.5)";
                }
            }
            else if (this.env.weather === "meteor_rain") {
                weatherBadge = "☄️ Meteoros";
            }
            else if (this.env.weather === "stardust_haze") {
                weatherBadge = "✨ Polvo Estelar";
            }
            drawArcadeText(ctx, weatherBadge, width - 16, 67, {
                size: 10,
                family: ARCADE_FONTS.HUD,
                align: "right",
                baseline: "middle",
                fill: weatherFill,
                strokeWidth: 2.5,
                glowColor: weatherGlow,
                glowBlur: 4,
            });
        }
        // 7. Badges de Power-ups Activos (v1.1.0)
        let pBadgeX = 14;
        const pBadgeY = 86;
        if (this.bunny.hasShield) {
            drawChamferPanel(ctx, pBadgeX, pBadgeY - 10, 84, 20, 4, {
                fillColor: "rgba(14, 165, 233, 0.25)",
                strokeColor: "#38bdf8",
                lineWidth: 1.2,
                drawBrackets: false
            });
            drawArcadeText(ctx, "🛡️ ESCUDO", pBadgeX + 42, pBadgeY, {
                size: 8.5,
                family: ARCADE_FONTS.HUD,
                align: "center",
                baseline: "middle",
                fill: ["#ffffff", "#38bdf8"],
                strokeWidth: 2,
                glowColor: "#00e5ff",
                glowBlur: 6
            });
            pBadgeX += 90;
        }
        if (this.bunny.magnetTimer > 0) {
            drawChamferPanel(ctx, pBadgeX, pBadgeY - 10, 78, 20, 4, {
                fillColor: "rgba(245, 158, 11, 0.25)",
                strokeColor: "#fbbf24",
                lineWidth: 1.2,
                drawBrackets: false
            });
            drawArcadeText(ctx, `🧲 ${Math.ceil(this.bunny.magnetTimer)}s`, pBadgeX + 39, pBadgeY, {
                size: 8.5,
                family: ARCADE_FONTS.HUD,
                align: "center",
                baseline: "middle",
                fill: ["#ffffff", "#fbbf24"],
                strokeWidth: 2,
                glowColor: "#f59e0b",
                glowBlur: 6
            });
        }
        // Alerta reactiva en pantalla si el conejo penetra en el techo de smog tóxico
        if (this.env.weather === "green_smog" && this.bunny.altitude >= 60) {
            const blink = Math.floor(Date.now() / 180) % 2 === 0;
            if (blink) {
                drawChamferPanel(ctx, width / 2 - 58, 86, 116, 20, 4, {
                    fillColor: "rgba(239, 68, 68, 0.88)",
                    strokeColor: "#fca5a5",
                    lineWidth: 1.5,
                    glowColor: "rgba(239, 68, 68, 0.9)",
                    glowBlur: 10,
                });
                drawArcadeText(ctx, "⚠️ SMOG DRAG!", width / 2, 96, {
                    size: 9.5,
                    family: ARCADE_FONTS.HUD,
                    align: "center",
                    baseline: "middle",
                    fill: "#ffffff",
                    strokeWidth: 2,
                });
            }
        }
        // Alerta de Viento a Favor en el tramo final antes de la meta
        const isTailwindHUD = this.targetDistance > 0 &&
            this.spawner.accumulatedAngle >= this.targetDistance - 0.28 &&
            this.spawner.accumulatedAngle < this.targetDistance;
        if (isTailwindHUD) {
            const blink = Math.floor(Date.now() / 150) % 2 === 0;
            if (blink) {
                drawChamferPanel(ctx, width / 2 - 80, 86, 160, 20, 4, {
                    fillColor: "rgba(14, 165, 233, 0.88)",
                    strokeColor: "#38bdf8",
                    lineWidth: 1.5,
                    glowColor: "rgba(0, 229, 255, 0.9)",
                    glowBlur: 10,
                });
                drawArcadeText(ctx, "💨 VIENTO A FAVOR! MEGA SALTO! 🚀", width / 2, 96, {
                    size: 8.5,
                    family: ARCADE_FONTS.HUD,
                    align: "center",
                    baseline: "middle",
                    fill: "#ffffff",
                    strokeWidth: 2,
                });
            }
        }
        // 7. Controles Táctiles Adaptados a 9:16
        this.renderVirtualButtons(ctx, width, height);
        ctx.restore();
    }
    renderHealthAndEnergyBars(ctx, x, y) {
        const barWidth = 92;
        // A) Barra de Salud (HP)
        const hpHeight = 7;
        ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
        ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
        ctx.lineWidth = 1;
        ctx.fillRect(x, y, barWidth, hpHeight);
        ctx.strokeRect(x, y, barWidth, hpHeight);
        const hpRatio = Math.max(0, Math.min(1, this.bunny.health / this.bunny.maxHealth));
        const hpFill = hpRatio * barWidth;
        if (hpFill > 0) {
            let hpColor = "#10b981"; // Verde esmeralda saludable
            if (hpRatio <= 0.3) {
                hpColor = "#ef4444"; // Rojo peligro
            }
            else if (hpRatio <= 0.6) {
                hpColor = "#f59e0b"; // Ámbar de aviso
            }
            ctx.fillStyle = hpColor;
            ctx.fillRect(x + 1, y + 1, Math.max(0, hpFill - 2), hpHeight - 2);
        }
        // Etiqueta de HP
        drawArcadeText(ctx, `❤️ ${Math.ceil(this.bunny.health)}`, x + barWidth + 6, y + 4, {
            size: 9,
            family: ARCADE_FONTS.HUD,
            align: "left",
            baseline: "middle",
            fill: ["#ffffff", "#34d399"],
            strokeWidth: 2,
            glowBlur: 0,
            shadowY: 1,
        });
        // B) Barra de Turbo (Energía Cósmica / Momentum)
        const turboY = y + 11;
        const turboHeight = 5;
        ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
        ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
        ctx.lineWidth = 1;
        ctx.fillRect(x, turboY, barWidth, turboHeight);
        ctx.strokeRect(x, turboY, barWidth, turboHeight);
        const turboFill = (this.bunny.cosmicEnergy / this.bunny.maxEnergy) * barWidth;
        if (turboFill > 0) {
            const grad = ctx.createLinearGradient(x, turboY, x + barWidth, turboY);
            grad.addColorStop(0, "#ff6600");
            grad.addColorStop(0.5, "#00e5ff");
            grad.addColorStop(1, "#c084fc");
            ctx.fillStyle = grad;
            ctx.fillRect(x + 1, turboY + 1, Math.max(0, turboFill - 2), turboHeight - 2);
        }
        drawArcadeText(ctx, "⚡ TURBO", x + barWidth + 6, turboY + 3, {
            size: 8,
            family: ARCADE_FONTS.HUD,
            align: "left",
            baseline: "middle",
            fill: ["#ffffff", "#38bdf8"],
            strokeWidth: 2,
            glowBlur: 0,
            shadowY: 1,
        });
    }
    renderThrusterBadge(ctx, centerX, y) {
        let text = "CRUCERO";
        let glowColor = "#38bdf8";
        let fillGrad = ["#ffffff", "#bae6fd"];
        if (this.bunny.currentTier === "WARP") {
            text = `⚡ WARP (${this.bunny.warpTimer.toFixed(1)}s) ⚡`;
            glowColor = "#c084fc";
            fillGrad = ["#ffffff", "#e879f9"];
        }
        else if (this.bunny.currentTier === "PLASMA") {
            text = "⚡ PLASMA x2.3";
            glowColor = "#00ffff";
            fillGrad = ["#ffffff", "#38bdf8"];
        }
        else if (this.bunny.currentTier === "COMBUSTION") {
            text = "⚡ TURBO x1.6";
            glowColor = "#f59e0b";
            fillGrad = ["#ffffff", "#fbbf24"];
        }
        else {
            text = `⚡ MOMENTUM ${Math.floor(this.bunny.cosmicEnergy)}%`;
            glowColor = "rgba(56, 189, 248, 0.5)";
            fillGrad = ["#ffffff", "#94a3b8"];
        }
        drawArcadeText(ctx, text, centerX, y, {
            size: 11,
            family: ARCADE_FONTS.HUD,
            italic: true,
            align: "center",
            baseline: "middle",
            fill: fillGrad,
            strokeWidth: 3,
            glowColor,
            glowBlur: this.bunny.currentTier !== "NORMAL" ? 14 : 6,
        });
    }
    renderVirtualButtons(ctx, width, height) {
        const isLeft = this.input.isMovingLeft();
        const isRight = this.input.isMovingRight();
        const isJumping = this.input.isJumping() || !this.bunny.isGrounded;
        const steer = this.input.steerValue; // -1.0 a +1.0
        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        // -------------------------------------------------------------
        // 1. MITAD IZQUIERDA: TOOL DIRECCIONAL DINÁMICO (VERDE / ROJO)
        // -------------------------------------------------------------
        const toolX = 14;
        const toolY = height - 58;
        const toolW = 152;
        const toolH = 36;
        const midX = toolX + toolW / 2; // 90
        // Marco base del tool deslizante
        ctx.fillStyle = "rgba(10, 15, 30, 0.75)";
        ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(toolX, toolY, toolW, toolH, 12);
        ctx.fill();
        ctx.stroke();
        // A) Franja Izquierda (Retroceso / Freno): ROJO si va hacia atrás
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(toolX + 2, toolY + 2, toolW / 2 - 3, toolH - 4, [10, 0, 0, 10]);
        if (isLeft || steer < -0.1) {
            ctx.shadowColor = "#ef4444";
            ctx.shadowBlur = 12;
            ctx.fillStyle = "rgba(239, 68, 68, 0.75)";
            ctx.fill();
            ctx.fillStyle = "#ffffff";
        }
        else {
            ctx.fillStyle = "rgba(239, 68, 68, 0.15)";
            ctx.fill();
            ctx.fillStyle = "rgba(252, 165, 165, 0.6)";
        }
        ctx.font = "bold 11px system-ui, sans-serif";
        ctx.fillText("◀ ATRÁS", toolX + toolW / 4, toolY + toolH / 2);
        ctx.restore();
        // B) Franja Derecha (Avance / Aceleración): VERDE si avanza
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(midX + 1, toolY + 2, toolW / 2 - 3, toolH - 4, [0, 10, 10, 0]);
        if (isRight || steer > 0.1) {
            ctx.shadowColor = "#10b981";
            ctx.shadowBlur = 14;
            ctx.fillStyle = "rgba(16, 185, 129, 0.85)";
            ctx.fill();
            ctx.fillStyle = "#ffffff";
        }
        else {
            ctx.fillStyle = "rgba(16, 185, 129, 0.15)";
            ctx.fill();
            ctx.fillStyle = "rgba(110, 231, 183, 0.6)";
        }
        ctx.font = "bold 11px system-ui, sans-serif";
        ctx.fillText("AVANCE ▶", midX + toolW / 4, toolY + toolH / 2);
        ctx.restore();
        // C) Puntero / Manija táctil interactiva
        const knobX = midX + steer * (toolW * 0.38);
        ctx.save();
        ctx.shadowColor = isRight ? "#34d399" : isLeft ? "#f87171" : "#38bdf8";
        ctx.shadowBlur = 8;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(knobX, toolY + toolH / 2, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        // Leyenda informativa compacta bajo el tool
        ctx.fillStyle = "rgba(148, 163, 184, 0.75)";
        ctx.font = "bold 8px monospace";
        ctx.fillText("DESLIZAR DIRECCIÓN • SWIPE ↓ BARRIDA", toolX + toolW / 2, height - 10);
        // -------------------------------------------------------------
        // 2. BOTÓN DE TURBO / NITRO (ESTILO ASPHALT - SUMADOR ADITIVO)
        // -------------------------------------------------------------
        const turboW = 74;
        const turboH = 44;
        const turboX = width - turboW - 14;
        const turboY = height - 60;
        const isTurboActive = this.bunny.isManualNitro;
        const isWarp = this.bunny.warpTimer > 0;
        const hasNitro = this.bunny.cosmicEnergy >= AstroBunny.MIN_NITRO_IGNITION;
        ctx.save();
        if (isWarp) {
            // Estado WARP / Shockwave: Oro y Neón Azul
            ctx.shadowColor = "#38bdf8";
            ctx.shadowBlur = 18;
            ctx.fillStyle = isTurboActive ? "rgba(56, 189, 248, 0.95)" : "rgba(14, 165, 233, 0.85)";
            ctx.strokeStyle = "#e0f2fe";
            ctx.lineWidth = 2.2;
        }
        else if (isTurboActive) {
            // Estado de Quemado Activo de Nitro (Presionando el botón con energía)
            ctx.shadowColor = "#f59e0b";
            ctx.shadowBlur = 18;
            ctx.fillStyle = "rgba(245, 158, 11, 0.92)";
            ctx.strokeStyle = "#fef08a";
            ctx.lineWidth = 2.2;
        }
        else if (hasNitro) {
            // Listo con carga: Azul Cian Neón Eléctrico
            ctx.shadowColor = "#06b6d4";
            ctx.shadowBlur = 12;
            ctx.fillStyle = "rgba(8, 145, 178, 0.82)";
            ctx.strokeStyle = "#67e8f9";
            ctx.lineWidth = 1.8;
        }
        else {
            // Sin energía o carga insuficiente: Atenuado oscuro sólido, CERO parpadeo
            ctx.shadowColor = "transparent";
            ctx.shadowBlur = 0;
            ctx.fillStyle = "rgba(30, 41, 59, 0.65)";
            ctx.strokeStyle = "#475569";
            ctx.lineWidth = 1.2;
        }
        ctx.beginPath();
        ctx.roundRect(turboX, turboY, turboW, turboH, 12);
        ctx.fill();
        ctx.stroke();
        // Texto del Botón de Turbo
        ctx.textAlign = "center";
        ctx.fillStyle = "#ffffff";
        if (isWarp) {
            ctx.font = "bold 10px system-ui, sans-serif";
            ctx.fillText(isTurboActive ? "⚡ SHOCKWAVE!" : "⚡ WARP", turboX + turboW / 2, turboY + 16);
            ctx.font = "bold 9px monospace";
            ctx.fillStyle = "#bae6fd";
            ctx.fillText("2.50x BOOST", turboX + turboW / 2, turboY + 31);
        }
        else if (isTurboActive) {
            ctx.font = "bold 11px system-ui, sans-serif";
            ctx.fillText("🔥 BOOST!", turboX + turboW / 2, turboY + 16);
            ctx.font = "bold 9px monospace";
            ctx.fillStyle = "#fef3c7";
            ctx.fillText(`${Math.floor(this.bunny.cosmicEnergy)}% NITRO`, turboX + turboW / 2, turboY + 31);
        }
        else if (hasNitro) {
            ctx.font = "bold 11px system-ui, sans-serif";
            ctx.fillText("⚡ TURBO", turboX + turboW / 2, turboY + 16);
            ctx.font = "bold 9px monospace";
            ctx.fillStyle = "#a5f3fc";
            ctx.fillText(`${Math.floor(this.bunny.cosmicEnergy)}% NITRO`, turboX + turboW / 2, turboY + 31);
        }
        else {
            ctx.font = "bold 10px system-ui, sans-serif";
            ctx.fillStyle = "#94a3b8";
            ctx.fillText(this.bunny.cosmicEnergy <= 0 ? "⚡ 0% VACÍO" : "⚡ TURBO", turboX + turboW / 2, turboY + 16);
            ctx.font = "bold 8px monospace";
            ctx.fillText("CARGA CON 🥕", turboX + turboW / 2, turboY + 31);
        }
        ctx.restore();
        // -------------------------------------------------------------
        // 3. FRANJA DERECHA: SALTO INTUITIVO (SIN CAJA ESTORBOSA)
        // -------------------------------------------------------------
        // Sutil brillo reactivo durante el salto o contacto táctil
        if (isJumping) {
            ctx.save();
            ctx.fillStyle = "rgba(74, 222, 128, 0.12)";
            ctx.fillRect(width / 2, height - 70, width / 2, 60);
            ctx.fillStyle = "#4ade80";
            ctx.font = "bold 11px system-ui, sans-serif";
            ctx.fillText("🚀 SALTO", width * 0.75, height - 38);
            ctx.restore();
        }
        // -------------------------------------------------------------
        // 4. GUÍA DE CONTROLES DE TECLADO (DETECTADO EN PC/DESKTOP)
        // -------------------------------------------------------------
        if (this.input.isKeyboardActive) {
            ctx.save();
            const kbW = width - 20;
            const kbH = 16;
            const kbX = 10;
            const kbY = height - 19;
            ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
            ctx.strokeStyle = "rgba(56, 189, 248, 0.45)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(kbX, kbY, kbW, kbH, 4);
            ctx.fill();
            ctx.stroke();
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.font = "bold 7.5px monospace";
            ctx.fillStyle = "#38bdf8";
            ctx.fillText("⌨️ [A/D] CONDUCIR • [ESPACIO] SALTO • [S] SLIDE • [E] TURBO", width / 2, kbY + kbH / 2);
            ctx.restore();
        }
        ctx.restore();
    }
}
window.addEventListener("DOMContentLoaded", () => {
    new AstroBunnyApp();
});
