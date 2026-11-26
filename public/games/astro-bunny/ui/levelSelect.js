import { StorageManager } from "../platform/storage.js";
import { ARCADE_FONTS, drawArcadeText, drawChamferPanel } from "./arcadeTheme.js";
export const CHAPTER_DEFINITIONS = [
    {
        chapterNumber: 1,
        id: "neo_cosmos",
        name: "Capítulo 1: Neo Cosmos",
        subtitle: "Planeta Ciberpunk • 19 Niveles",
        badge: "MUNDO 1",
        colorCore: "#09122c",
        colorSurface: "#162856",
        colorAtmosphere: "rgba(0, 229, 255, 0.45)",
        colorVeins: "#00e5ff",
        textureType: "neon_circuits",
        gravity: 1600,
        radius: 780,
        enemyType: "coyote",
        defaultWeather: "solar_wind"
    },
    {
        chapterNumber: 2,
        id: "dunas_rojas",
        name: "Capítulo 2: Dunas Rojas",
        subtitle: "Desierto Carmesí • 19 Niveles",
        badge: "MUNDO 2",
        colorCore: "#2a0808",
        colorSurface: "#881337",
        colorAtmosphere: "rgba(244, 63, 94, 0.45)",
        colorVeins: "#f43f5e",
        textureType: "dunes",
        gravity: 1720,
        radius: 800,
        enemyType: "snake",
        defaultWeather: "stardust_haze"
    },
    {
        chapterNumber: 3,
        id: "ciber_glaciar",
        name: "Capítulo 3: Ciber-Glaciar",
        subtitle: "Glaciar Plasma • 19 Niveles",
        badge: "MUNDO 3",
        colorCore: "#041a2f",
        colorSurface: "#0284c7",
        colorAtmosphere: "rgba(125, 211, 252, 0.5)",
        colorVeins: "#7dd3fc",
        textureType: "ice_crystals",
        gravity: 1480,
        radius: 820,
        enemyType: "all",
        defaultWeather: "solar_wind"
    },
    {
        chapterNumber: 4,
        id: "forja_volcanica",
        name: "Capítulo 4: Forja Volcánica",
        subtitle: "Núcleo de Magma • 19 Niveles",
        badge: "MUNDO 4",
        colorCore: "#3b0707",
        colorSurface: "#7f1d1d",
        colorAtmosphere: "rgba(249, 115, 22, 0.5)",
        colorVeins: "#f97316",
        textureType: "dunes",
        gravity: 1800,
        radius: 760,
        enemyType: "snake",
        defaultWeather: "meteor_rain"
    },
    {
        chapterNumber: 5,
        id: "vortice_vacio",
        name: "Capítulo 5: Vórtice del Vacío",
        subtitle: "Dimensión Hiperespacio • 19 Niveles",
        badge: "GRAN FINAL",
        colorCore: "#1e0b36",
        colorSurface: "#3b0764",
        colorAtmosphere: "rgba(192, 132, 252, 0.5)",
        colorVeins: "#c084fc",
        textureType: "neon_circuits",
        gravity: 1650,
        radius: 840,
        enemyType: "all",
        defaultWeather: "green_smog"
    }
];
// -------------------------------------------------------------
// 19 NIVELES COMPLETOS Y CALIBRADOS DEL CAPÍTULO 1 (NEO COSMOS)
// -------------------------------------------------------------
const CHAPTER_1_LEVELS = [
    {
        id: "nc_1_1",
        chapterNumber: 1,
        levelNumber: 1,
        levelCode: "1-1",
        title: "1-1: Fogueo Orbital",
        subtitle: "Cap. 1: Carrera de Fogueo • 40s",
        badge: "INICIO",
        colorCore: "#09122c",
        colorSurface: "#162856",
        colorAtmosphere: "rgba(0, 229, 255, 0.45)",
        colorVeins: "#00e5ff",
        textureType: "neon_circuits",
        gravity: 1600,
        radius: 780,
        enemyType: "coyote",
        enemyFrequency: 1.0,
        targetLaps: 2,
        targetTime: 40.0,
        weatherType: "solar_wind"
    },
    {
        id: "nc_1_2",
        chapterNumber: 1,
        levelNumber: 2,
        levelCode: "1-2",
        title: "1-2: Toxic Wind",
        subtitle: "Ch. 1: Green Smog • 2 Min Endurance",
        badge: "DESAFÍO",
        colorCore: "#071a12",
        colorSurface: "#0f392b",
        colorAtmosphere: "rgba(34, 197, 94, 0.45)",
        colorVeins: "#4ade80",
        textureType: "neon_circuits",
        gravity: 1600,
        radius: 780,
        enemyType: "coyote",
        enemyFrequency: 1.3,
        targetLaps: 7,
        targetTime: 120.0,
        weatherType: "green_smog",
        scarcityMode: true
    },
    {
        id: "nc_1_3",
        chapterNumber: 1,
        levelNumber: 3,
        levelCode: "1-3",
        title: "1-3: Pasaje Láser",
        subtitle: "Ch. 1: Vigas de Plasma • Domina el Slide",
        badge: "SLIDE",
        colorCore: "#09122c",
        colorSurface: "#162856",
        colorAtmosphere: "rgba(0, 229, 255, 0.45)",
        colorVeins: "#00e5ff",
        textureType: "neon_circuits",
        gravity: 1600,
        radius: 780,
        enemyType: "coyote",
        enemyFrequency: 1.1,
        targetLaps: 3,
        targetTime: 50.0,
        weatherType: "solar_wind"
    },
    {
        id: "nc_1_4",
        chapterNumber: 1,
        levelNumber: 4,
        levelCode: "1-4",
        title: "1-4: Emboscada Coyote",
        subtitle: "Ch. 1: Patrullas Terrestres Frecuentes",
        badge: "COMBATE",
        colorCore: "#09122c",
        colorSurface: "#1e3a8a",
        colorAtmosphere: "rgba(59, 130, 246, 0.45)",
        colorVeins: "#60a5fa",
        textureType: "neon_circuits",
        gravity: 1600,
        radius: 780,
        enemyType: "coyote",
        enemyFrequency: 1.5,
        targetLaps: 3,
        targetTime: 48.0,
        weatherType: "solar_wind"
    },
    {
        id: "nc_1_5",
        chapterNumber: 1,
        levelNumber: 5,
        levelCode: "1-5",
        title: "1-5: Ráfagas de Plasma",
        subtitle: "Ch. 1: Corriente Acelerada y Rampas Boost",
        badge: "VELOCIDAD",
        colorCore: "#09122c",
        colorSurface: "#162856",
        colorAtmosphere: "rgba(0, 229, 255, 0.45)",
        colorVeins: "#00e5ff",
        textureType: "neon_circuits",
        gravity: 1600,
        radius: 780,
        enemyType: "coyote",
        enemyFrequency: 1.2,
        targetLaps: 3,
        targetTime: 45.0,
        weatherType: "solar_wind"
    },
    {
        id: "nc_1_6",
        chapterNumber: 1,
        levelNumber: 6,
        levelCode: "1-6",
        title: "1-6: Corredor de Púas",
        subtitle: "Ch. 1: Púas de Cristal y Saltos Cortos",
        badge: "PRECISIÓN",
        colorCore: "#0f172a",
        colorSurface: "#334155",
        colorAtmosphere: "rgba(148, 163, 184, 0.4)",
        colorVeins: "#38bdf8",
        textureType: "neon_circuits",
        gravity: 1600,
        radius: 780,
        enemyType: "coyote",
        enemyFrequency: 1.2,
        targetLaps: 3,
        targetTime: 45.0,
        weatherType: "solar_wind"
    },
    {
        id: "nc_1_7",
        chapterNumber: 1,
        levelNumber: 7,
        levelCode: "1-7",
        title: "1-7: Lluvia Meteórica I",
        subtitle: "Ch. 1: Meteoros Parabólicos en Órbita",
        badge: "METEOROS",
        colorCore: "#1c1917",
        colorSurface: "#44403c",
        colorAtmosphere: "rgba(251, 146, 60, 0.45)",
        colorVeins: "#fb923c",
        textureType: "neon_circuits",
        gravity: 1600,
        radius: 780,
        enemyType: "coyote",
        enemyFrequency: 1.1,
        targetLaps: 4,
        targetTime: 58.0,
        weatherType: "meteor_rain"
    },
    {
        id: "nc_1_8",
        chapterNumber: 1,
        levelNumber: 8,
        levelCode: "1-8",
        title: "1-8: Escasez Energética",
        subtitle: "Ch. 1: Pocas Zanahorias • Administra Nitro",
        badge: "ESCASEZ",
        colorCore: "#09122c",
        colorSurface: "#162856",
        colorAtmosphere: "rgba(0, 229, 255, 0.45)",
        colorVeins: "#00e5ff",
        textureType: "neon_circuits",
        gravity: 1600,
        radius: 780,
        enemyType: "coyote",
        enemyFrequency: 1.3,
        targetLaps: 4,
        targetTime: 55.0,
        weatherType: "solar_wind",
        scarcityMode: true
    },
    {
        id: "nc_1_9",
        chapterNumber: 1,
        levelNumber: 9,
        levelCode: "1-9",
        title: "1-9: Smog y Láser",
        subtitle: "Ch. 1: Troposfera Tóxica + Slide Táctico",
        badge: "TÉCNICO",
        colorCore: "#071a12",
        colorSurface: "#0f392b",
        colorAtmosphere: "rgba(34, 197, 94, 0.45)",
        colorVeins: "#4ade80",
        textureType: "neon_circuits",
        gravity: 1600,
        radius: 780,
        enemyType: "coyote",
        enemyFrequency: 1.4,
        targetLaps: 4,
        targetTime: 60.0,
        weatherType: "green_smog"
    },
    {
        id: "nc_1_10",
        chapterNumber: 1,
        levelNumber: 10,
        levelCode: "1-10",
        title: "1-10: Sprint Relámpago",
        subtitle: "Ch. 1: 3 Vueltas en 36s • Cero Errores",
        badge: "SPEEDRUN",
        colorCore: "#09122c",
        colorSurface: "#162856",
        colorAtmosphere: "rgba(0, 229, 255, 0.45)",
        colorVeins: "#00e5ff",
        textureType: "neon_circuits",
        gravity: 1600,
        radius: 780,
        enemyType: "coyote",
        enemyFrequency: 1.0,
        targetLaps: 3,
        targetTime: 36.0,
        weatherType: "solar_wind"
    },
    {
        id: "nc_1_11",
        chapterNumber: 1,
        levelNumber: 11,
        levelCode: "1-11",
        title: "1-11: Patrullas Dobles",
        subtitle: "Ch. 1: Coyotes Escalonados y Nave Nodriza",
        badge: "EMBOSCADA",
        colorCore: "#09122c",
        colorSurface: "#1e3a8a",
        colorAtmosphere: "rgba(59, 130, 246, 0.45)",
        colorVeins: "#60a5fa",
        textureType: "neon_circuits",
        gravity: 1600,
        radius: 780,
        enemyType: "coyote",
        enemyFrequency: 1.8,
        targetLaps: 4,
        targetTime: 58.0,
        weatherType: "solar_wind"
    },
    {
        id: "nc_1_12",
        chapterNumber: 1,
        levelNumber: 12,
        levelCode: "1-12",
        title: "1-12: Zona de Cráteres",
        subtitle: "Ch. 1: Arcos de Zanahorias y Hang-Time",
        badge: "AGILIDAD",
        colorCore: "#09122c",
        colorSurface: "#162856",
        colorAtmosphere: "rgba(0, 229, 255, 0.45)",
        colorVeins: "#00e5ff",
        textureType: "neon_circuits",
        gravity: 1600,
        radius: 780,
        enemyType: "coyote",
        enemyFrequency: 1.3,
        targetLaps: 4,
        targetTime: 54.0,
        weatherType: "solar_wind"
    },
    {
        id: "nc_1_13",
        chapterNumber: 1,
        levelNumber: 13,
        levelCode: "1-13",
        title: "1-13: Lluvia Meteórica II",
        subtitle: "Ch. 1: Bombardeo Orbital Intenso (1.4x)",
        badge: "INTENSO",
        colorCore: "#1c1917",
        colorSurface: "#44403c",
        colorAtmosphere: "rgba(251, 146, 60, 0.45)",
        colorVeins: "#fb923c",
        textureType: "neon_circuits",
        gravity: 1600,
        radius: 780,
        enemyType: "coyote",
        enemyFrequency: 1.3,
        targetLaps: 5,
        targetTime: 68.0,
        weatherType: "meteor_rain"
    },
    {
        id: "nc_1_14",
        chapterNumber: 1,
        levelNumber: 14,
        levelCode: "1-14",
        title: "1-14: Laberinto de Plasma",
        subtitle: "Ch. 1: Dobles Vigas y Púas Consecutivas",
        badge: "LABERINTO",
        colorCore: "#09122c",
        colorSurface: "#162856",
        colorAtmosphere: "rgba(0, 229, 255, 0.45)",
        colorVeins: "#00e5ff",
        textureType: "neon_circuits",
        gravity: 1600,
        radius: 780,
        enemyType: "coyote",
        enemyFrequency: 1.6,
        targetLaps: 5,
        targetTime: 65.0,
        weatherType: "solar_wind"
    },
    {
        id: "nc_1_15",
        chapterNumber: 1,
        levelNumber: 15,
        levelCode: "1-15",
        title: "1-15: Resistencia 90s",
        subtitle: "Ch. 1: 6 Vueltas en Troposfera de Smog",
        badge: "RESISTENCIA",
        colorCore: "#071a12",
        colorSurface: "#0f392b",
        colorAtmosphere: "rgba(34, 197, 94, 0.45)",
        colorVeins: "#4ade80",
        textureType: "neon_circuits",
        gravity: 1600,
        radius: 780,
        enemyType: "coyote",
        enemyFrequency: 1.4,
        targetLaps: 6,
        targetTime: 90.0,
        weatherType: "green_smog",
        scarcityMode: true
    },
    {
        id: "nc_1_16",
        chapterNumber: 1,
        levelNumber: 16,
        levelCode: "1-16",
        title: "1-16: Alta Gravedad",
        subtitle: "Ch. 1: Gravedad 1750 • Salto Pesado",
        badge: "GRAVEDAD",
        colorCore: "#09122c",
        colorSurface: "#162856",
        colorAtmosphere: "rgba(0, 229, 255, 0.45)",
        colorVeins: "#00e5ff",
        textureType: "neon_circuits",
        gravity: 1750,
        radius: 780,
        enemyType: "coyote",
        enemyFrequency: 1.5,
        targetLaps: 5,
        targetTime: 64.0,
        weatherType: "solar_wind"
    },
    // NIVELES DE DIFICULTAD EXTREMA ("CASI IMPOSIBLE")
    {
        id: "nc_1_17",
        chapterNumber: 1,
        levelNumber: 17,
        levelCode: "1-17",
        title: "1-17: ☠️ Tormenta del Juicio",
        subtitle: "Ch. 1: Smog Feroz + Enjambres de Coyotes",
        badge: "HARDCORE",
        colorCore: "#071a12",
        colorSurface: "#0f392b",
        colorAtmosphere: "rgba(239, 68, 68, 0.5)",
        colorVeins: "#ef4444",
        textureType: "neon_circuits",
        gravity: 1650,
        radius: 780,
        enemyType: "coyote",
        enemyFrequency: 2.1,
        targetLaps: 6,
        targetTime: 75.0,
        weatherType: "green_smog",
        scarcityMode: true
    },
    {
        id: "nc_1_18",
        chapterNumber: 1,
        levelNumber: 18,
        levelCode: "1-18",
        title: "1-18: ☠️ Corredor de la Muerte",
        subtitle: "Ch. 1: Meteoros Incesantes y Cero Tregua",
        badge: "EXTREMO",
        colorCore: "#1c1917",
        colorSurface: "#44403c",
        colorAtmosphere: "rgba(239, 68, 68, 0.55)",
        colorVeins: "#dc2626",
        textureType: "neon_circuits",
        gravity: 1680,
        radius: 780,
        enemyType: "coyote",
        enemyFrequency: 2.3,
        targetLaps: 6,
        targetTime: 70.0,
        weatherType: "meteor_rain",
        scarcityMode: true
    },
    {
        id: "nc_1_19",
        chapterNumber: 1,
        levelNumber: 19,
        levelCode: "1-19",
        title: "1-19: 🏆 APOCALIPSIS CÓSMICO",
        subtitle: "Ch. 1: ¡GRAN FINAL! • 8 Vueltas Imposibles",
        badge: "🏆 FINAL",
        colorCore: "#020617",
        colorSurface: "#0f172a",
        colorAtmosphere: "rgba(244, 63, 94, 0.65)",
        colorVeins: "#fbbf24",
        textureType: "neon_circuits",
        gravity: 1720,
        radius: 780,
        enemyType: "coyote",
        enemyFrequency: 2.5,
        targetLaps: 8,
        targetTime: 108.0,
        weatherType: "green_smog",
        scarcityMode: true
    }
];
// Generador determinista para los 19 niveles de los Capítulos 2 a 5
function generateChapterLevels(def) {
    const levels = [];
    const titles = [
        "Iniciación", "Corredor Táctico", "Vórtice Inicial", "Emboscada Rápida",
        "Alta Fricción", "Púas y Desfiladeros", "Lluvia Incandescente", "Escasez Primaria",
        "Tormenta Frontal", "Sprint de Precisión", "Patrulla Cruzada", "Zona Sísmica",
        "Bombardeo Pesado", "Laberinto Extremo", "Prueba de Resistencia", "Alta Densidad",
        "☠️ Furia Desatada", "☠️ Muro del Caos", "🏆 CAMPEÓN DEFINITIVO"
    ];
    for (let l = 1; l <= 19; l++) {
        const isHardcore = l >= 17;
        const isFinal = l === 19;
        const levelCode = `${def.chapterNumber}-${l}`;
        // Laps y tiempo calibrados matemáticamente
        let laps = 2 + Math.floor(l / 4);
        if (l === 2)
            laps = 6;
        if (isHardcore)
            laps = 6;
        if (isFinal)
            laps = 8;
        const time = 30.0 + laps * 9.5;
        const weather = l % 3 === 0 ? "meteor_rain" : l % 2 === 0 ? "green_smog" : def.defaultWeather;
        levels.push({
            id: `${def.id}_${l}`,
            chapterNumber: def.chapterNumber,
            levelNumber: l,
            levelCode,
            title: `${levelCode}: ${isFinal ? `🏆 ${titles[l - 1]}` : isHardcore ? `☠️ ${titles[l - 1]}` : titles[l - 1]}`,
            subtitle: `Cap. ${def.chapterNumber} • ${def.name.split(":")[1]?.trim() || def.name}`,
            badge: isFinal ? "🏆 FINAL" : isHardcore ? "EXTREMO" : l === 1 ? "INICIO" : undefined,
            colorCore: def.colorCore,
            colorSurface: def.colorSurface,
            colorAtmosphere: isHardcore ? "rgba(239, 68, 68, 0.55)" : def.colorAtmosphere,
            colorVeins: isFinal ? "#fbbf24" : def.colorVeins,
            textureType: def.textureType,
            gravity: def.gravity + (l > 15 ? 80 : 0),
            radius: def.radius,
            enemyType: def.enemyType,
            enemyFrequency: 1.0 + (l * 0.08),
            targetLaps: laps,
            targetTime: Math.round(time),
            weatherType: weather,
            scarcityMode: l >= 8
        });
    }
    return levels;
}
// Catálogo Maestro Completo de 95 Niveles (5 Capítulos × 19 Niveles)
export const GAME_LEVELS = [
    ...CHAPTER_1_LEVELS,
    ...generateChapterLevels(CHAPTER_DEFINITIONS[1]),
    ...generateChapterLevels(CHAPTER_DEFINITIONS[2]),
    ...generateChapterLevels(CHAPTER_DEFINITIONS[3]),
    ...generateChapterLevels(CHAPTER_DEFINITIONS[4])
];
export const PLANET_CHAPTERS = GAME_LEVELS;
export function getLevelByCode(levelCode) {
    return GAME_LEVELS.find(l => l.levelCode === levelCode);
}
export function getLevel(chapter, levelNumber) {
    return GAME_LEVELS.find(l => l.chapterNumber === chapter && l.levelNumber === levelNumber);
}
// -------------------------------------------------------------
// MODAL DE SELECCIÓN EN DOS VISTAS (CAPÍTULOS -> CUADRÍCULA 19)
// -------------------------------------------------------------
export class LevelSelectModal {
    isOpen = false;
    viewMode = "CHAPTERS";
    selectedChapter = 1; // 1 a 5
    selectedIndex = 0; // Índice absoluto en GAME_LEVELS
    open(chapter = 1) {
        this.isOpen = true;
        this.viewMode = "CHAPTERS";
        this.selectedChapter = chapter;
    }
    close() {
        this.isOpen = false;
        this.viewMode = "CHAPTERS";
    }
    toggle() {
        if (this.isOpen) {
            this.close();
        }
        else {
            this.open();
        }
    }
    handleTouch(clickX, clickY) {
        if (!this.isOpen)
            return null;
        const modalX = 16;
        const modalY = 75;
        const modalW = 328;
        const modalH = 475;
        // 1. Tocar el fondo oscuro exterior cierra el modal
        if (clickX < modalX || clickX > modalX + modalW || clickY < modalY || clickY > modalY + modalH) {
            this.close();
            return null;
        }
        // 2. Botón de cerrar [✕] en esquina superior derecha
        if (clickX >= modalX + modalW - 40 && clickX <= modalX + modalW && clickY >= modalY && clickY <= modalY + 45) {
            this.close();
            return null;
        }
        const storage = StorageManager.getInstance();
        // ---------------------------------------------------------
        // VISTA A: SELECTOR DE CAPÍTULOS (5 Mundos Temáticos)
        // ---------------------------------------------------------
        if (this.viewMode === "CHAPTERS") {
            const startY = modalY + 54;
            const cardH = 68;
            const gap = 12;
            for (let i = 0; i < CHAPTER_DEFINITIONS.length; i++) {
                const top = startY + i * (cardH + gap);
                if (clickX >= modalX + 12 && clickX <= modalX + modalW - 12 && clickY >= top && clickY <= top + cardH) {
                    this.selectedChapter = i + 1;
                    this.viewMode = "LEVELS";
                    return null;
                }
            }
            return null;
        }
        // ---------------------------------------------------------
        // VISTA B: CUADRÍCULA DE 19 NIVELES DEL CAPÍTULO SELECCIONADO
        // ---------------------------------------------------------
        if (this.viewMode === "LEVELS") {
            // Botón volver a capítulos [ ← CAPÍTULOS ]
            if (clickX >= modalX + 10 && clickX <= modalX + 120 && clickY >= modalY + 12 && clickY <= modalY + 46) {
                this.viewMode = "CHAPTERS";
                return null;
            }
            // Cuadrícula de 19 casillas (4 columnas x 5 filas)
            const gridStartX = modalX + 14;
            const gridStartY = modalY + 58;
            const colW = 68;
            const rowH = 54;
            const gapX = 9;
            const gapY = 8;
            const chapterLevels = GAME_LEVELS.filter(l => l.chapterNumber === this.selectedChapter);
            for (let i = 0; i < 19; i++) {
                const levelNum = i + 1;
                let x = 0;
                let y = 0;
                let w = colW;
                let h = rowH;
                if (i < 16) {
                    const col = i % 4;
                    const row = Math.floor(i / 4);
                    x = gridStartX + col * (colW + gapX);
                    y = gridStartY + row * (rowH + gapY);
                }
                else if (i === 16) {
                    // Nivel 17
                    x = gridStartX;
                    y = gridStartY + 4 * (rowH + gapY);
                }
                else if (i === 17) {
                    // Nivel 18
                    x = gridStartX + (colW + gapX);
                    y = gridStartY + 4 * (rowH + gapY);
                }
                else {
                    // Nivel 19 (FINAL CLÍMAX - Doble ancho)
                    x = gridStartX + 2 * (colW + gapX);
                    y = gridStartY + 4 * (rowH + gapY);
                    w = colW * 2 + gapX;
                }
                if (clickX >= x && clickX <= x + w && clickY >= y && clickY <= y + h) {
                    const isUnlocked = storage.isLevelUnlocked(this.selectedChapter, levelNum);
                    if (isUnlocked && chapterLevels[i]) {
                        this.selectedIndex = GAME_LEVELS.indexOf(chapterLevels[i]);
                        this.close();
                        return chapterLevels[i];
                    }
                    return null; // Nivel bloqueado
                }
            }
        }
        return null;
    }
    render(ctx, width, height) {
        if (!this.isOpen)
            return;
        ctx.save();
        // Oscurecimiento de fondo
        ctx.fillStyle = "rgba(1, 2, 8, 0.88)";
        ctx.fillRect(0, 0, width, height);
        const modalX = 16;
        const modalY = 75;
        const modalW = 328;
        const modalH = 475;
        drawChamferPanel(ctx, modalX, modalY, modalW, modalH, 14, {
            fillColor: "rgba(9, 13, 30, 0.95)",
            strokeColor: "#00e5ff",
            lineWidth: 2,
            glowColor: "rgba(0, 229, 255, 0.4)",
            glowBlur: 14,
            drawBrackets: true,
        });
        const storage = StorageManager.getInstance();
        // ---------------------------------------------------------
        // RENDER VISTA A: SELECTOR DE CAPÍTULOS
        // ---------------------------------------------------------
        if (this.viewMode === "CHAPTERS") {
            drawArcadeText(ctx, "SELECTOR DE CAPÍTULOS", width / 2, modalY + 28, {
                size: 14,
                family: ARCADE_FONTS.TITLE,
                fill: ["#ffffff", "#00e5ff"],
                strokeWidth: 3,
                glowColor: "#00e5ff",
                glowBlur: 8,
            });
            // Botón Cerrar [✕]
            drawArcadeText(ctx, "✕", modalX + modalW - 22, modalY + 28, {
                size: 15,
                family: ARCADE_FONTS.HUD,
                fill: "#94a3b8",
                strokeWidth: 2
            });
            const startY = modalY + 54;
            const cardH = 68;
            const gap = 12;
            for (let i = 0; i < CHAPTER_DEFINITIONS.length; i++) {
                const ch = CHAPTER_DEFINITIONS[i];
                const y = startY + i * (cardH + gap);
                // Sumar estrellas del capítulo
                let chapterStars = 0;
                for (let l = 1; l <= 19; l++) {
                    chapterStars += storage.getLevelStars(`${ch.chapterNumber}-${l}`);
                }
                drawChamferPanel(ctx, modalX + 10, y, modalW - 20, cardH, 8, {
                    fillColor: "rgba(19, 26, 53, 0.9)",
                    strokeColor: ch.colorVeins,
                    lineWidth: 1.5,
                    glowBlur: 6,
                    glowColor: ch.colorVeins
                });
                // Orbe del planeta en miniatura
                ctx.save();
                ctx.fillStyle = ch.colorSurface;
                ctx.strokeStyle = ch.colorAtmosphere;
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.arc(modalX + 38, y + cardH / 2, 20, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                // Vena brillante
                ctx.strokeStyle = ch.colorVeins;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(modalX + 38, y + cardH / 2, 13, -0.6, 1.2);
                ctx.stroke();
                ctx.restore();
                // Título del capítulo
                drawArcadeText(ctx, ch.name, modalX + 70, y + 22, {
                    size: 12.5,
                    family: ARCADE_FONTS.HUD,
                    align: "left",
                    fill: ["#ffffff", ch.colorVeins],
                    strokeWidth: 2.5
                });
                // Subtítulo
                drawArcadeText(ctx, ch.subtitle, modalX + 70, y + 42, {
                    size: 9.5,
                    family: ARCADE_FONTS.HUD,
                    align: "left",
                    fill: "#94a3b8",
                    strokeWidth: 2
                });
                // Estrellas acumuladas
                drawArcadeText(ctx, `⭐ ${chapterStars}/57`, modalX + modalW - 22, y + 42, {
                    size: 10,
                    family: ARCADE_FONTS.HUD,
                    align: "right",
                    fill: "#fde047",
                    strokeWidth: 2
                });
                // Badge lateral
                drawArcadeText(ctx, ch.badge, modalX + modalW - 22, y + 22, {
                    size: 9.5,
                    family: ARCADE_FONTS.HUD,
                    align: "right",
                    fill: ["#ffffff", ch.colorVeins],
                    strokeWidth: 2
                });
            }
        }
        // ---------------------------------------------------------
        // RENDER VISTA B: CUADRÍCULA DE 19 NIVELES
        // ---------------------------------------------------------
        if (this.viewMode === "LEVELS") {
            const currentChapter = CHAPTER_DEFINITIONS[this.selectedChapter - 1] || CHAPTER_DEFINITIONS[0];
            // Botón [ ← CAPÍTULOS ]
            drawChamferPanel(ctx, modalX + 10, modalY + 12, 102, 30, 4, {
                fillColor: "rgba(30, 41, 59, 0.9)",
                strokeColor: "#38bdf8",
                lineWidth: 1.2
            });
            drawArcadeText(ctx, "← CAPÍTULOS", modalX + 61, modalY + 27, {
                size: 9.5,
                family: ARCADE_FONTS.HUD,
                fill: "#38bdf8",
                strokeWidth: 2
            });
            // Título del capítulo
            drawArcadeText(ctx, `CAP. ${this.selectedChapter}`, width / 2 + 35, modalY + 27, {
                size: 14,
                family: ARCADE_FONTS.TITLE,
                fill: ["#ffffff", currentChapter.colorVeins],
                strokeWidth: 3,
                glowColor: currentChapter.colorVeins,
                glowBlur: 8
            });
            // Botón Cerrar [✕]
            drawArcadeText(ctx, "✕", modalX + modalW - 20, modalY + 27, {
                size: 15,
                family: ARCADE_FONTS.HUD,
                fill: "#94a3b8",
                strokeWidth: 2
            });
            // Cuadrícula de 19 niveles (4x5)
            const gridStartX = modalX + 14;
            const gridStartY = modalY + 56;
            const colW = 68;
            const rowH = 54;
            const gapX = 9;
            const gapY = 8;
            for (let i = 0; i < 19; i++) {
                const levelNum = i + 1;
                const levelCode = `${this.selectedChapter}-${levelNum}`;
                const isUnlocked = storage.isLevelUnlocked(this.selectedChapter, levelNum);
                const stars = storage.getLevelStars(levelCode);
                const isHardcore = levelNum >= 17;
                const isFinal = levelNum === 19;
                let x = 0;
                let y = 0;
                let w = colW;
                let h = rowH;
                if (i < 16) {
                    const col = i % 4;
                    const row = Math.floor(i / 4);
                    x = gridStartX + col * (colW + gapX);
                    y = gridStartY + row * (rowH + gapY);
                }
                else if (i === 16) {
                    x = gridStartX;
                    y = gridStartY + 4 * (rowH + gapY);
                }
                else if (i === 17) {
                    x = gridStartX + (colW + gapX);
                    y = gridStartY + 4 * (rowH + gapY);
                }
                else {
                    // Nivel 19 (FINAL CLÍMAX - Doble casilla)
                    x = gridStartX + 2 * (colW + gapX);
                    y = gridStartY + 4 * (rowH + gapY);
                    w = colW * 2 + gapX;
                }
                // Estilo de tarjeta según dificultad y estado
                let borderColor = isUnlocked ? (isFinal ? "#f59e0b" : isHardcore ? "#ef4444" : currentChapter.colorVeins) : "#334155";
                let fillColor = isUnlocked ? (isFinal ? "rgba(245, 158, 11, 0.2)" : isHardcore ? "rgba(239, 68, 68, 0.2)" : "rgba(19, 26, 53, 0.95)") : "rgba(15, 23, 42, 0.7)";
                drawChamferPanel(ctx, x, y, w, h, 6, {
                    fillColor,
                    strokeColor: borderColor,
                    lineWidth: isFinal ? 2.0 : 1.2,
                    glowBlur: isUnlocked && (isFinal || isHardcore) ? 8 : 0,
                    glowColor: borderColor
                });
                if (isUnlocked) {
                    // Título de la casilla
                    const label = isFinal ? `🏆 19: FINAL` : isHardcore ? `☠️ ${levelNum}` : `${levelNum}`;
                    drawArcadeText(ctx, label, x + w / 2, y + 19, {
                        size: isFinal ? 11 : 13,
                        family: ARCADE_FONTS.TITLE,
                        fill: isFinal ? ["#ffffff", "#f59e0b"] : isHardcore ? ["#ffffff", "#ef4444"] : ["#ffffff", "#00e5ff"],
                        strokeWidth: 2.5
                    });
                    // Estrellas
                    const starStr = stars > 0 ? "⭐".repeat(stars) : "• • •";
                    drawArcadeText(ctx, starStr, x + w / 2, y + 38, {
                        size: stars > 0 ? 9 : 8,
                        family: ARCADE_FONTS.HUD,
                        fill: stars > 0 ? "#fde047" : "#64748b",
                        strokeWidth: 1.5
                    });
                }
                else {
                    // Bloqueado con candado
                    drawArcadeText(ctx, "🔒", x + w / 2, y + 20, {
                        size: 13,
                        family: ARCADE_FONTS.HUD,
                        fill: "#64748b",
                        strokeWidth: 1.5
                    });
                    drawArcadeText(ctx, `${levelNum}`, x + w / 2, y + 38, {
                        size: 9.5,
                        family: ARCADE_FONTS.HUD,
                        fill: "#475569",
                        strokeWidth: 1.5
                    });
                }
            }
            // Tip de pie
            drawArcadeText(ctx, "⭐ GANA AL MENOS 1 ESTRELLA PARA DESBLOQUEAR EL SIGUIENTE NIVEL", width / 2, modalY + modalH - 14, {
                size: 8,
                family: ARCADE_FONTS.HUD,
                fill: "#94a3b8",
                strokeWidth: 1.5
            });
        }
        ctx.restore();
    }
}
