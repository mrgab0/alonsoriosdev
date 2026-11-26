import { installYTGameMock } from "./mock.js";
export class PlayablesBridge {
    static instance;
    firstFrameSent = false;
    gameReadySent = false;
    constructor() {
        installYTGameMock();
    }
    static getInstance() {
        if (!PlayablesBridge.instance) {
            PlayablesBridge.instance = new PlayablesBridge();
        }
        return PlayablesBridge.instance;
    }
    /**
     * Inicializa de forma prioritaria el SDK de Playgama Bridge al arrancar la app.
     */
    async init() {
        try {
            const b = window.bridge;
            if (b && typeof b.initialize === "function") {
                await b.initialize();
                console.log("[PlaygamaBridge] Initialized successfully at startup");
            }
        }
        catch (e) {
            console.warn("[PlaygamaBridge] Startup init error:", e);
        }
    }
    /**
     * Comunica a YouTube que se renderizó el primer frame visual.
     * Debe llamarse una única vez al renderizar la primera vista/pantalla.
     */
    notifyFirstFrame() {
        if (this.firstFrameSent)
            return;
        this.firstFrameSent = true;
        try {
            window.ytgame?.game.firstFrameReady();
        }
        catch (e) {
            console.error("[PlayablesBridge] Error en firstFrameReady:", e);
        }
    }
    /**
     * Comunica a YouTube y Playgama que el juego cargó todos los assets y la interactividad está lista.
     */
    notifyGameReady() {
        if (this.gameReadySent)
            return;
        this.gameReadySent = true;
        try {
            window.ytgame?.game.gameReady();
        }
        catch (e) {
            console.error("[PlayablesBridge] Error en gameReady:", e);
        }
        try {
            const b = window.bridge;
            b?.platform?.sendMessage?.("game_ready");
            console.log("[PlaygamaBridge] Sent game_ready signal to host");
        }
        catch (e) {
            console.warn("[PlaygamaBridge] Error sending game_ready signal:", e);
        }
    }
    /**
     * Notifica el inicio de una sesión de gameplay activo.
     */
    notifyGameplayStart() {
        try {
            window.bridge?.platform?.sendMessage?.("gameplay_started");
        }
        catch (e) {
            console.warn("[PlayablesBridge] notifyGameplayStart error:", e);
        }
    }
    /**
     * Notifica el fin o pausa del gameplay (muerte o nivel terminado).
     */
    notifyGameplayStop() {
        try {
            window.bridge?.platform?.sendMessage?.("gameplay_stopped");
        }
        catch (e) {
            console.warn("[PlayablesBridge] notifyGameplayStop error:", e);
        }
    }
    /**
     * Verifica si el audio está habilitado a nivel de sistema YouTube.
     */
    isAudioEnabled() {
        try {
            return window.ytgame?.system.isAudioEnabled() ?? true;
        }
        catch {
            return true;
        }
    }
    /**
     * Suscribe a cambios globales de activación/desactivación de sonido.
     */
    onAudioChange(callback) {
        try {
            window.ytgame?.system.onAudioEnabledChange(callback);
        }
        catch (e) {
            console.warn("[PlayablesBridge] onAudioEnabledChange error:", e);
        }
    }
    /**
     * Suscribe a eventos de pausa del host (ej. cambio de pestaña o app minimization).
     */
    onPause(callback) {
        try {
            window.ytgame?.system.onPause(callback);
        }
        catch (e) {
            console.warn("[PlayablesBridge] onPause error:", e);
        }
    }
    /**
     * Suscribe a eventos de reanudación del host.
     */
    onResume(callback) {
        try {
            window.ytgame?.system.onResume(callback);
        }
        catch (e) {
            console.warn("[PlayablesBridge] onResume error:", e);
        }
    }
    /**
     * Idioma del usuario (formato ISO 639-1, ej: 'es', 'en').
     */
    getLanguage() {
        try {
            return window.ytgame?.system.getLanguage() ?? "es";
        }
        catch {
            return "es";
        }
    }
}
