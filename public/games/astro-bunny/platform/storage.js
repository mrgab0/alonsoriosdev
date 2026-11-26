const DEFAULT_SAVE_DATA = {
    highScore: 0,
    cosmicCarrots: 0,
    unlockedSkins: ["classic_rabbit"],
    selectedSkin: "classic_rabbit",
    unlockedPlanets: 1,
    unlockedLevels: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1 },
    levelStars: {},
    soundEnabled: true
};
export class StorageManager {
    static instance;
    currentData = { ...DEFAULT_SAVE_DATA };
    constructor() { }
    static getInstance() {
        if (!StorageManager.instance) {
            StorageManager.instance = new StorageManager();
        }
        return StorageManager.instance;
    }
    async load() {
        try {
            if (window.ytgame?.game.loadData) {
                const raw = await window.ytgame.game.loadData();
                if (raw && raw !== "{}" && typeof raw === "string") {
                    const parsed = JSON.parse(raw);
                    this.currentData = { ...DEFAULT_SAVE_DATA, ...parsed };
                    return this.currentData;
                }
            }
            const b = window.bridge;
            if (b?.storage?.get) {
                try {
                    const timeoutP = new Promise((resolve) => setTimeout(() => resolve(null), 1000));
                    const res = await Promise.race([b.storage.get(["save_data"]), timeoutP]);
                    const raw = Array.isArray(res) ? res[0] : (res?.save_data ?? res);
                    if (raw && raw !== "{}" && typeof raw === "string") {
                        const parsed = JSON.parse(raw);
                        this.currentData = { ...DEFAULT_SAVE_DATA, ...parsed };
                        return this.currentData;
                    }
                    else if (raw && typeof raw === "object") {
                        this.currentData = { ...DEFAULT_SAVE_DATA, ...raw };
                        return this.currentData;
                    }
                }
                catch (err) {
                    console.warn("[StorageManager] Bridge storage read error:", err);
                }
            }
        }
        catch (e) {
            console.warn("[StorageManager] Fallback a datos por defecto al leer:", e);
        }
        this.currentData = { ...DEFAULT_SAVE_DATA };
        return this.currentData;
    }
    async save(partial) {
        this.currentData = { ...this.currentData, ...partial };
        try {
            if (window.ytgame?.game.saveData) {
                const payload = JSON.stringify(this.currentData);
                await window.ytgame.game.saveData(payload);
            }
            const b = window.bridge;
            if (b?.storage?.set) {
                const payload = JSON.stringify(this.currentData);
                // Playgama Bridge SDK v2 espera arrays paralelos: (keys[], values[])
                await b.storage.set(["save_data"], [payload]);
            }
        }
        catch (e) {
            console.warn("[StorageManager] Error guardando progreso en la nube:", e);
        }
    }
    getData() {
        return { ...this.currentData };
    }
    getLevelStars(levelCode) {
        return this.currentData.levelStars?.[levelCode] ?? 0;
    }
    isLevelUnlocked(chapter, levelNumber) {
        if (levelNumber === 1)
            return true; // El nivel 1 de cada capítulo siempre está accesible
        const maxUnlocked = this.currentData.unlockedLevels?.[chapter] ?? 1;
        return levelNumber <= maxUnlocked;
    }
    recordLevelCompletion(chapter, levelNumber, stars) {
        const levelCode = `${chapter}-${levelNumber}`;
        const prevStars = this.getLevelStars(levelCode);
        const newStars = Math.max(prevStars, stars);
        const levelStars = { ...(this.currentData.levelStars || {}), [levelCode]: newStars };
        const unlockedLevels = { ...(this.currentData.unlockedLevels || {}) };
        // Si ganó al menos 1 estrella, desbloquea el siguiente nivel
        const currentMax = unlockedLevels[chapter] ?? 1;
        if (levelNumber >= currentMax && levelNumber < 19) {
            unlockedLevels[chapter] = levelNumber + 1;
        }
        else if (levelNumber === 19 && chapter < 5) {
            // Si superó el nivel 19 (final del capítulo), desbloquea el siguiente capítulo
            unlockedLevels[chapter + 1] = Math.max(unlockedLevels[chapter + 1] ?? 1, 1);
        }
        this.save({ levelStars, unlockedLevels });
    }
    isSkinUnlocked(skinId) {
        if (skinId === "classic_rabbit")
            return true;
        return this.currentData.unlockedSkins?.includes(skinId) ?? false;
    }
    unlockSkin(skinId) {
        const list = this.currentData.unlockedSkins || ["classic_rabbit"];
        if (!list.includes(skinId)) {
            list.push(skinId);
            this.save({ unlockedSkins: list, selectedSkin: skinId });
        }
    }
    selectSkin(skinId) {
        if (this.isSkinUnlocked(skinId)) {
            this.save({ selectedSkin: skinId });
        }
    }
    spendCarrots(amount) {
        const current = this.currentData.cosmicCarrots || 0;
        if (current >= amount) {
            this.save({ cosmicCarrots: current - amount });
            return true;
        }
        return false;
    }
    addCarrots(amount) {
        const current = this.currentData.cosmicCarrots || 0;
        this.save({ cosmicCarrots: current + amount });
    }
}
