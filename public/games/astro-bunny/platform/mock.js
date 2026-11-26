/**
 * Instala un emulador local para el SDK de YouTube Playables (ytgame).
 * Se activa únicamente si window.ytgame no fue inyectado por YouTube.
 */
export function installYTGameMock() {
    if (typeof window.ytgame !== "undefined") {
        console.info("[Playables] SDK oficial de YouTube detectado en el host.");
        return;
    }
    let audioEnabled = true;
    const audioListeners = [];
    const pauseListeners = [];
    const resumeListeners = [];
    const mockYTGame = {
        game: {
            firstFrameReady: () => {
                console.log("%c[YTGame Mock] %cfirstFrameReady()", "color: #ff0033; font-weight: bold", "color: #00e5ff");
            },
            gameReady: () => {
                console.log("%c[YTGame Mock] %cgameReady()", "color: #ff0033; font-weight: bold", "color: #00e5ff");
            },
            saveData: async (data) => {
                try {
                    localStorage.setItem("ytgame_save_data_mock", data);
                    console.log("[YTGame Mock] saveData guardado en localStorage:", data);
                }
                catch (e) {
                    console.warn("[YTGame Mock] Error guardando datos:", e);
                }
            },
            loadData: async () => {
                try {
                    const d = localStorage.getItem("ytgame_save_data_mock") || "{}";
                    console.log("[YTGame Mock] loadData recuperado:", d);
                    return d;
                }
                catch {
                    return "{}";
                }
            }
        },
        system: {
            isAudioEnabled: () => audioEnabled,
            onAudioEnabledChange: (cb) => {
                audioListeners.push(cb);
            },
            onPause: (cb) => {
                pauseListeners.push(cb);
            },
            onResume: (cb) => {
                resumeListeners.push(cb);
            },
            getLanguage: () => {
                return (navigator.language || "es").slice(0, 2);
            }
        },
        ads: {
            requestInterstitialAd: async () => {
                console.log("%c[YTGame Mock] Mostrando Interstitial Ad (simulado 1.2s)...", "color: #ffaa00");
                await new Promise((resolve) => setTimeout(resolve, 1200));
                console.log("%c[YTGame Mock] Interstitial Ad completado.", "color: #00ff66");
            },
            requestRewardedAd: async (rewardId) => {
                console.log(`%c[YTGame Mock] Mostrando Rewarded Ad '${rewardId}' (simulado 1.5s)...`, "color: #ffaa00");
                await new Promise((resolve) => setTimeout(resolve, 1500));
                console.log(`%c[YTGame Mock] Recompensa '${rewardId}' otorgada con éxito!`, "color: #00ff66");
            }
        }
    };
    window.ytgame = mockYTGame;
    console.info("[Playables] Mock local de YouTube Playables activado con éxito.");
}
