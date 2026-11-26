/**
 * Motor de Audio Procedimental Autónomo (Web Audio API)
 * Astro Bunny Space GP - SFX Sintéticos y Música Synthwave / Chiptune
 * 100% Procedural • 0 KB de archivos externos • Latencia Cero • YouTube Playables v1
 */
export class SoundEngine {
    static instance;
    ctx = null;
    masterGain = null;
    compressor = null;
    sfxGain = null;
    bgmGain = null;
    enabled = true;
    isInitialized = false;
    // Secuenciador de Música Procedimental
    currentTheme = "NONE";
    bgmTimer = null;
    currentStep = 0;
    nextNoteTime = 0;
    bpm = 124;
    // Notas musicales en Hz (Escala Pentatónica Cósmica A Menor)
    NOTES = {
        A2: 110.00,
        C3: 130.81,
        D3: 146.83,
        E3: 164.81,
        G3: 196.00,
        A3: 220.00,
        C4: 261.63,
        D4: 293.66,
        E4: 329.63,
        G4: 392.00,
        A4: 440.00,
        C5: 523.25,
        D5: 587.33,
        E5: 659.25,
        G5: 783.99,
        A5: 880.00,
        C6: 1046.50,
        D6: 1174.66,
        E6: 1318.51,
        G6: 1567.98,
        A6: 1760.00,
        C7: 2093.00
    };
    constructor() {
        // Inicialización pasiva; se activará con el primer toque del usuario
    }
    static getInstance() {
        if (!SoundEngine.instance) {
            SoundEngine.instance = new SoundEngine();
        }
        return SoundEngine.instance;
    }
    /**
     * Desbloquea el AudioContext en el primer gesto del usuario (User Interaction)
     */
    initOnGesture() {
        if (this.isInitialized && this.ctx && this.ctx.state === "running") {
            return;
        }
        if (typeof window === "undefined")
            return;
        try {
            const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtxClass)
                return;
            if (!this.ctx) {
                this.ctx = new AudioCtxClass();
                // Cadena de Ganancia: Master -> Compresor Dinámico -> Destino
                this.masterGain = this.ctx.createGain();
                this.masterGain.gain.setValueAtTime(this.enabled ? 0.8 : 0, this.ctx.currentTime);
                // Compresor Dinámico: Previene clipping digital y elimina chasquidos/distorsión
                this.compressor = this.ctx.createDynamicsCompressor();
                this.compressor.threshold.setValueAtTime(-12, this.ctx.currentTime);
                this.compressor.knee.setValueAtTime(30, this.ctx.currentTime);
                this.compressor.ratio.setValueAtTime(12, this.ctx.currentTime);
                this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
                this.compressor.release.setValueAtTime(0.15, this.ctx.currentTime);
                this.masterGain.connect(this.compressor);
                this.compressor.connect(this.ctx.destination);
                this.sfxGain = this.ctx.createGain();
                this.sfxGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
                this.sfxGain.connect(this.masterGain);
                this.bgmGain = this.ctx.createGain();
                this.bgmGain.gain.setValueAtTime(0.32, this.ctx.currentTime);
                this.bgmGain.connect(this.masterGain);
            }
            if (this.ctx.state === "suspended") {
                this.ctx.resume();
            }
            this.isInitialized = true;
            // Si ya existía un tema solicitado antes del gesto (ej: MENU en bootstrap), arrancarlo ahora
            if (this.currentTheme !== "NONE" && this.bgmTimer === null) {
                const pendingTheme = this.currentTheme;
                this.currentTheme = "NONE";
                this.startBGM(pendingTheme);
            }
        }
        catch (e) {
            console.warn("[SoundEngine] Error al iniciar AudioContext:", e);
        }
    }
    setEnabled(enabled) {
        this.enabled = enabled;
        if (this.masterGain && this.ctx) {
            const targetGain = enabled ? 0.8 : 0.0001;
            this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05);
        }
    }
    // =========================================================================
    // 1. EFECTOS DE SONIDO (SFX SINTÉTICOS PROCEDURALES)
    // =========================================================================
    /**
     * Clic suave y futurista en botones de interfaz
     */
    playMenuClick() {
        if (!this.enabled || !this.ctx || !this.sfxGain)
            return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.04);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.04);
    }
    /**
     * Salto: Tono de resorte estelar ascendente
     */
    playJump() {
        if (!this.enabled || !this.ctx || !this.sfxGain)
            return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(480, now + 0.14);
        gain.gain.setValueAtTime(0.45, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.15);
    }
    /**
     * Hang-Time: Micro-impulso de sustentación del jetpack
     */
    playHangTime() {
        if (!this.enabled || !this.ctx || !this.sfxGain)
            return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.08);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.08);
    }
    /**
     * Slide: Barrida aerodinámica rasante con fricción
     */
    playSlide() {
        if (!this.enabled || !this.ctx || !this.sfxGain)
            return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(420, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.18);
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(2200, now);
        filter.frequency.exponentialRampToValueAtTime(800, now + 0.18);
        filter.Q.setValueAtTime(2.0, now);
        gain.gain.setValueAtTime(0.32, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.18);
    }
    /**
     * Alerta Contrarreloj (Time Warning): Bip agudo de advertencia cuando quedan < 10s
     */
    playTimeWarning() {
        if (!this.enabled || !this.ctx || !this.sfxGain)
            return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(1760, now); // A6 agudo penetrante
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.08);
    }
    /**
     * Victoria de Nivel Contrarreloj: Fanfarria ascendente triunfal y brillante
     */
    playLevelComplete() {
        if (!this.enabled || !this.ctx || !this.sfxGain)
            return;
        this.stopBGM();
        const now = this.ctx.currentTime;
        const notes = [this.NOTES.A4, this.NOTES.C5, this.NOTES.E5, this.NOTES.A5, this.NOTES.C6, this.NOTES.E6];
        notes.forEach((freq, idx) => {
            const t = now + idx * 0.07;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = "triangle";
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.35, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(t);
            osc.stop(t + 0.28);
        });
    }
    /**
     * Cuenta Atrás de Salida (3, 2, 1, ¡DESPEGUE!)
     */
    playCountdownTick(isGo) {
        if (!this.enabled || !this.ctx || !this.sfxGain)
            return;
        const now = this.ctx.currentTime;
        if (!isGo) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(659.25, now); // E5
            gain.gain.setValueAtTime(0.28, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(now);
            osc.stop(now + 0.09);
        }
        else {
            // Acorde brillante ascendente de despegue
            [1318.51, 1760].forEach((freq) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = "triangle";
                osc.frequency.setValueAtTime(freq, now);
                gain.gain.setValueAtTime(0.32, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
                osc.connect(gain);
                gain.connect(this.sfxGain);
                osc.start(now);
                osc.stop(now + 0.24);
            });
        }
    }
    /**
     * Cruce de Portal Warp (Cosmic Warp Gate Pass)
     */
    playGatePass() {
        if (!this.enabled || !this.ctx || !this.sfxGain)
            return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(260, now + 0.28);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.28);
    }
    /**
     * Alerta de Transición de Acto (Acto 2 Tormenta / Acto 3 Última Vuelta)
     */
    playActAlert() {
        if (!this.enabled || !this.ctx || !this.sfxGain)
            return;
        const now = this.ctx.currentTime;
        [880, 1318.51].forEach((freq, idx) => {
            const t = now + idx * 0.08;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.25, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(t);
            osc.stop(t + 0.14);
        });
    }
    /**
     * Disparo Láser Cóncavo: Estilo Contra Alien Wars
     */
    playLaser() {
        if (!this.enabled || !this.ctx || !this.sfxGain)
            return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(980, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.12);
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(3200, now);
        filter.frequency.exponentialRampToValueAtTime(400, now + 0.12);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.13);
    }
    /**
     * Recolección de Zanahoria: Chime cristalino alegre (C5 -> E5 -> G5)
     */
    playCarrot() {
        if (!this.enabled || !this.ctx || !this.sfxGain)
            return;
        const now = this.ctx.currentTime;
        const notes = [this.NOTES.C5, this.NOTES.E5, this.NOTES.G5];
        notes.forEach((freq, idx) => {
            const noteTime = now + idx * 0.05;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, noteTime);
            gain.gain.setValueAtTime(0.35, noteTime);
            gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.12);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(noteTime);
            osc.stop(noteTime + 0.12);
        });
    }
    /**
     * Villano Desintegrado con Láser: Explosión retro crujiente
     */
    playEnemyZap() {
        if (!this.enabled || !this.ctx || !this.sfxGain)
            return;
        const now = this.ctx.currentTime;
        // Buffer de ruido blanco
        const bufferSize = Math.floor(this.ctx.sampleRate * 0.18);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(1400, now);
        filter.frequency.exponentialRampToValueAtTime(150, now + 0.18);
        filter.Q.setValueAtTime(3.0, now);
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        noise.start(now);
        noise.stop(now + 0.18);
    }
    /**
     * Impacto de Daño / Tropiezo con Obstáculo
     */
    playHit() {
        if (!this.enabled || !this.ctx || !this.sfxGain)
            return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.22);
        gain.gain.setValueAtTime(0.55, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.22);
    }
    /**
     * Nitro / Turbo Boost Estilo Asphalt: Inyección sónica ascendente con resonancia
     */
    playNitro() {
        if (!this.enabled || !this.ctx || !this.sfxGain)
            return;
        const now = this.ctx.currentTime;
        // 1. Tono principal de turbina supersónica (Sawtooth con sweep ascendente)
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(740, now + 0.18);
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(400, now);
        filter.frequency.exponentialRampToValueAtTime(1600, now + 0.18);
        filter.Q.setValueAtTime(3.0, now);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.22);
        // 2. Ruido blanco filtrado para efecto de siseo de escape de gas
        const bufferSize = Math.floor(this.ctx.sampleRate * 0.16);
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        const whiteNoise = this.ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = "highpass";
        noiseFilter.frequency.setValueAtTime(1200, now);
        noiseFilter.frequency.linearRampToValueAtTime(2800, now + 0.16);
        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.20, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        whiteNoise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.sfxGain);
        whiteNoise.start(now);
        whiteNoise.stop(now + 0.16);
    }
    /**
     * Modo Warp: Fanfarria de hiperespacio ascendente
     */
    playWarp() {
        if (!this.enabled || !this.ctx || !this.sfxGain)
            return;
        const now = this.ctx.currentTime;
        const arp = [this.NOTES.A3, this.NOTES.C4, this.NOTES.E4, this.NOTES.A4, this.NOTES.C5, this.NOTES.E5];
        arp.forEach((freq, i) => {
            const t = now + i * 0.04;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.28, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(t);
            osc.stop(t + 0.1);
        });
    }
    /**
     * Fin de Carrera (Game Over): Secuencia descendente melancólica
     */
    playGameOver() {
        if (!this.enabled || !this.ctx || !this.sfxGain)
            return;
        this.stopBGM();
        const now = this.ctx.currentTime;
        const chord = [this.NOTES.E4, this.NOTES.C4, this.NOTES.A3, this.NOTES.E3];
        chord.forEach((freq, idx) => {
            const t = now + idx * 0.16;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = "triangle";
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.4, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(t);
            osc.stop(t + 0.35);
        });
    }
    // =========================================================================
    // 2. MÚSICA PROCEDIMENTAL DINÁMICA (BGM SYNTHWAVE / CHIPTUNE)
    // =========================================================================
    startBGM(theme) {
        if (this.currentTheme === theme)
            return;
        this.stopBGM();
        this.currentTheme = theme;
        if (!this.enabled || !this.ctx || theme === "NONE")
            return;
        if (theme === "MENU") {
            this.bpm = 88;
        }
        else if (theme === "RACE") {
            this.bpm = 126;
        }
        else if (theme === "WARP") {
            this.bpm = 152;
        }
        this.currentStep = 0;
        this.nextNoteTime = this.ctx.currentTime + 0.05;
        this.runSequencerLoop();
    }
    stopBGM() {
        if (this.bgmTimer !== null) {
            window.clearTimeout(this.bgmTimer);
            this.bgmTimer = null;
        }
        this.currentTheme = "NONE";
    }
    pause() {
        if (this.ctx && this.ctx.state === "running") {
            this.ctx.suspend();
        }
    }
    resume() {
        if (this.ctx && this.ctx.state === "suspended") {
            this.ctx.resume().then(() => {
                if (this.currentTheme !== "NONE" && this.ctx) {
                    this.nextNoteTime = this.ctx.currentTime + 0.02;
                }
            });
        }
    }
    runSequencerLoop() {
        if (this.currentTheme === "NONE" || !this.ctx)
            return;
        // Margen robusto de 350ms para evitar micro-cortes, tartamudeo y buffer underrun
        const lookAheadTime = 0.35;
        const stepDuration = 60 / this.bpm / 4; // Duración de una semicorchea (1/16th)
        // Protección anti-desincronización: si hubo lag o suspensión, sincronizar al presente
        if (this.nextNoteTime < this.ctx.currentTime) {
            this.nextNoteTime = this.ctx.currentTime + 0.02;
        }
        while (this.nextNoteTime < this.ctx.currentTime + lookAheadTime) {
            this.playStep(this.currentStep, this.nextNoteTime, stepDuration);
            this.nextNoteTime += stepDuration;
            this.currentStep = (this.currentStep + 1) % 16;
        }
        // Intervalo de sondeo regular de 25ms
        this.bgmTimer = window.setTimeout(() => this.runSequencerLoop(), 25);
    }
    playStep(step, time, duration) {
        if (!this.ctx || !this.bgmGain || !this.enabled)
            return;
        if (this.currentTheme === "MENU") {
            // Arpegio Espacial Suave (Ondas sinusoidales y triangulares)
            const menuPattern = [
                this.NOTES.A3, 0, this.NOTES.C4, 0,
                this.NOTES.E4, 0, this.NOTES.G4, 0,
                this.NOTES.E4, 0, this.NOTES.C4, 0,
                this.NOTES.D4, 0, this.NOTES.E4, 0
            ];
            const freq = menuPattern[step];
            if (freq > 0) {
                this.synthArpNote(freq, time, duration * 2.2, "sine", 0.18);
            }
        }
        else if (this.currentTheme === "RACE" || this.currentTheme === "WARP") {
            // 1. Línea de Bajo (Nivelado para no saturar altavoces de móvil)
            const bassPattern = [
                this.NOTES.A2, this.NOTES.A2, this.NOTES.A3, this.NOTES.A2,
                this.NOTES.C3, this.NOTES.C3, this.NOTES.D3, this.NOTES.E3,
                this.NOTES.A2, this.NOTES.A2, this.NOTES.A3, this.NOTES.A2,
                this.NOTES.G2 || 98, this.NOTES.G2 || 98, this.NOTES.E3, this.NOTES.G3
            ];
            const bassFreq = bassPattern[step];
            if (bassFreq > 0) {
                this.synthBassNote(bassFreq, time, duration * 1.5, 0.16);
            }
            // 2. Bombo / Platillo Sintético
            if (step === 0 || step === 4 || step === 8 || step === 12) {
                this.synthKick(time);
            }
            else if (step === 2 || step === 6 || step === 10 || step === 14) {
                this.synthHiHat(time);
            }
            // 3. Melodía Principal Transpuesta a Octavas Agudas Brillantes (A5, C6, E6, etc.)
            const leadPattern = [
                this.NOTES.A5, 0, this.NOTES.C6, 0,
                this.NOTES.E6, this.NOTES.D6, 0, this.NOTES.C6,
                this.NOTES.A5, 0, this.NOTES.G5, 0,
                this.NOTES.A5, this.NOTES.C6, this.NOTES.D6, 0
            ];
            const leadFreq = leadPattern[step];
            if (leadFreq > 0) {
                this.synthBrightLead(leadFreq, time, duration * 1.25, 0.22);
            }
            // 4. Capa de Campanillas Cósmicas (Sparkle Chimes) en Contratiempo Agudo
            const sparklePattern = [
                0, this.NOTES.E6, 0, this.NOTES.A6,
                0, this.NOTES.G6, 0, this.NOTES.E6,
                0, this.NOTES.C6, 0, this.NOTES.E6,
                0, this.NOTES.A6, 0, this.NOTES.C7
            ];
            const sparkleFreq = sparklePattern[step];
            if (sparkleFreq > 0) {
                this.synthSparkleNote(sparkleFreq, time, duration * 0.9, 0.14);
            }
        }
    }
    synthBrightLead(freq, time, duration, volume) {
        if (!this.ctx || !this.bgmGain)
            return;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, time);
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(Math.min(3200, freq * 1.8), time);
        filter.Q.setValueAtTime(1.5, time);
        gain.gain.setValueAtTime(volume, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.bgmGain);
        osc.start(time);
        osc.stop(time + duration);
    }
    synthSparkleNote(freq, time, duration, volume) {
        if (!this.ctx || !this.bgmGain)
            return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(volume, time);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
        osc.connect(gain);
        gain.connect(this.bgmGain);
        osc.start(time);
        osc.stop(time + duration);
    }
    synthBassNote(freq, time, duration, volume) {
        if (!this.ctx || !this.bgmGain)
            return;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, time);
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(600, time);
        filter.frequency.exponentialRampToValueAtTime(180, time + duration);
        gain.gain.setValueAtTime(volume, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.bgmGain);
        osc.start(time);
        osc.stop(time + duration);
    }
    synthArpNote(freq, time, duration, wave, volume) {
        if (!this.ctx || !this.bgmGain)
            return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = wave;
        osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(volume, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
        osc.connect(gain);
        gain.connect(this.bgmGain);
        osc.start(time);
        osc.stop(time + duration);
    }
    synthKick(time) {
        if (!this.ctx || !this.bgmGain)
            return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(130, time);
        osc.frequency.exponentialRampToValueAtTime(38, time + 0.08);
        gain.gain.setValueAtTime(0.35, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.09);
        osc.connect(gain);
        gain.connect(this.bgmGain);
        osc.start(time);
        osc.stop(time + 0.09);
    }
    synthHiHat(time) {
        if (!this.ctx || !this.bgmGain)
            return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(6500, time);
        gain.gain.setValueAtTime(0.08, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);
        osc.connect(gain);
        gain.connect(this.bgmGain);
        osc.start(time);
        osc.stop(time + 0.03);
    }
}
