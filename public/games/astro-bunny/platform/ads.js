export class AdManager {
    static instance;
    lastInterstitialTimestamp = 0;
    INTERSTITIAL_COOLDOWN_MS = 180000; // 3 minutos de cooldown recomendado
    constructor() { }
    static getInstance() {
        if (!AdManager.instance) {
            AdManager.instance = new AdManager();
        }
        return AdManager.instance;
    }
    /**
     * Consulta si la plataforma actual soporta anuncios de video recompensado.
     */
    isRewardedSupported() {
        const b = window.bridge;
        if (b?.advertisement && typeof b.advertisement.isRewardedSupported !== "undefined") {
            return Boolean(b.advertisement.isRewardedSupported);
        }
        if (window.ytgame?.ads?.requestRewardedAd) {
            return true;
        }
        return false;
    }
    /**
     * Muestra un anuncio intersticial si ha transcurrido el tiempo de cooldown.
     * Maneja pausas y errores con resiliencia garantizada.
     */
    async showInterstitial(onPause, onResume) {
        try {
            // 1. Prioridad: Playgama Bridge (si está soportado en la plataforma actual)
            const b = window.bridge;
            if (b?.advertisement?.showInterstitial && b.advertisement.isInterstitialSupported) {
                if (onPause)
                    onPause();
                await b.advertisement.showInterstitial();
                this.lastInterstitialTimestamp = Date.now();
                return true;
            }
            // 2. Cooldown para entornos YouTube Playables estándar
            const now = Date.now();
            if (now - this.lastInterstitialTimestamp < this.INTERSTITIAL_COOLDOWN_MS) {
                return false;
            }
            if (onPause)
                onPause();
            if (window.ytgame?.ads?.requestInterstitialAd) {
                await window.ytgame.ads.requestInterstitialAd();
                this.lastInterstitialTimestamp = Date.now();
                return true;
            }
            return false;
        }
        catch (error) {
            console.warn("[AdManager] Interstitial Ad no disponible o cancelado:", error);
            return false;
        }
        finally {
            if (onResume)
                onResume();
        }
    }
    /**
     * Muestra un anuncio recompensado voluntario para el usuario.
     * En plataformas sin red de anuncios (como Itch.io o offline), concede la recompensa
     * de cortesía para que el jugador nunca se quede frustrado.
     * @param rewardId Identificador único de la recompensa (ej: 'double_carrots', 'revive')
     * @returns true si el usuario completó la visualización o se otorgó la cortesía.
     */
    async showRewarded(rewardId, onPause, onResume) {
        try {
            if (onPause)
                onPause();
            // 1. Playgama Bridge (solo si la red publicitaria está activa y soportada)
            const b = window.bridge;
            if (b?.advertisement?.showRewarded && b.advertisement.isRewardedSupported) {
                return new Promise((resolve) => {
                    let rewarded = false;
                    const stateHandler = (state) => {
                        if (state === "rewarded") {
                            rewarded = true;
                        }
                        else if (state === "closed" || state === "failed") {
                            if (typeof b.advertisement.off === "function") {
                                b.advertisement.off("rewarded_state_changed", stateHandler);
                            }
                            if (onResume)
                                onResume();
                            // Si falló por indisponibilidad de anuncios en la plataforma, conceder cortesía
                            if (state === "failed" && !rewarded) {
                                console.log("[AdManager] Anuncio no disponible en la red: concediendo revivir por cortesía");
                                resolve(true);
                            }
                            else {
                                resolve(rewarded);
                            }
                        }
                    };
                    if (typeof b.advertisement.on === "function") {
                        b.advertisement.on("rewarded_state_changed", stateHandler);
                    }
                    try {
                        b.advertisement.showRewarded(rewardId);
                    }
                    catch (e) {
                        console.warn("[AdManager] Error invocando showRewarded en bridge:", e);
                        if (typeof b.advertisement.off === "function") {
                            b.advertisement.off("rewarded_state_changed", stateHandler);
                        }
                        if (onResume)
                            onResume();
                        resolve(true); // Cortesía ante fallo técnico
                    }
                });
            }
            // 2. YouTube Playables Oficial
            if (window.ytgame?.ads?.requestRewardedAd) {
                await window.ytgame.ads.requestRewardedAd(rewardId);
                if (onResume)
                    onResume();
                return true;
            }
            // 3. Plataformas sin anuncios (ej. Itch.io / Standalone Web): Conceder recompensa de cortesía
            console.log(`[AdManager] Entorno sin red publicitaria (ej. Itch.io): otorgando '${rewardId}' como segunda oportunidad`);
            await new Promise((r) => setTimeout(r, 250));
            if (onResume)
                onResume();
            return true;
        }
        catch (error) {
            console.warn("[AdManager] Rewarded Ad fallido:", error);
            if (onResume)
                onResume();
            return true; // Cortesía para no arruinar la experiencia
        }
    }
}
