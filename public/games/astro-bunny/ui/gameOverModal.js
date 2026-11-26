import { ARCADE_FONTS, drawArcadeText, drawChamferPanel } from "./arcadeTheme.js";
export class GameOverModal {
    handleTouch(clickX, clickY, width, isVictory = false) {
        const centerX = width / 2;
        // 1. REINTENTAR o SIGUIENTE NIVEL: y: 380 a 450 (Caja generosa centrada en 415)
        if (clickX >= centerX - 110 && clickX <= centerX + 110 && clickY >= 380 && clickY <= 450) {
            return isVictory ? "NEXT_LEVEL" : "RETRY";
        }
        // 2. MENÚ PRINCIPAL: y: 450 a 520 (Caja generosa centrada en 478)
        if (clickX >= centerX - 110 && clickX <= centerX + 110 && clickY >= 450 && clickY <= 520) {
            return "MENU";
        }
        return null;
    }
    render(ctx, width, height, stats) {
        ctx.save();
        // Fondo oscurecido con viñeta arcade
        ctx.fillStyle = "rgba(2, 4, 12, 0.92)";
        ctx.fillRect(0, 0, width, height);
        const centerX = width / 2;
        const modalY = 140;
        const modalW = 286;
        const modalH = 390;
        const isVictory = stats.isVictory || stats.reason === "VICTORY";
        const isTimeout = stats.reason === "TIMEOUT";
        const accentColor = isVictory ? "#10b981" : isTimeout ? "#f59e0b" : "#ff0077";
        const glowColor = isVictory ? "rgba(16, 185, 129, 0.6)" : isTimeout ? "rgba(245, 158, 11, 0.6)" : "rgba(255, 0, 119, 0.5)";
        // Caja de Fin de Carrera / Victoria estilo cabina biselada
        drawChamferPanel(ctx, centerX - modalW / 2, modalY, modalW, modalH, 14, {
            fillColor: "rgba(9, 13, 30, 0.95)",
            strokeColor: accentColor,
            lineWidth: 2.2,
            glowColor,
            glowBlur: 14,
            drawBrackets: true,
        });
        // Título Principal Arcade 3D
        const titleText = isVictory ? "¡MISIÓN CUMPLIDA!" : isTimeout ? "¡TIEMPO AGOTADO!" : "FIN DE CARRERA";
        const titleGradient = isVictory
            ? ["#ffffff", "#34d399"]
            : isTimeout
                ? ["#ffffff", "#fbbf24"]
                : ["#ffffff", "#f43f5e"];
        drawArcadeText(ctx, titleText, centerX, modalY + 38, {
            size: 19,
            family: ARCADE_FONTS.TITLE,
            italic: true,
            fill: titleGradient,
            strokeWidth: 4,
            glowColor,
            glowBlur: 10,
        });
        // Subtítulo con estrellas
        const starsStr = isVictory ? "⭐".repeat(stats.stars || 3) : "";
        const subtitleText = isVictory ? `${starsStr} META A TIEMPO ${starsStr}` : isTimeout ? "CONTRARRELOJ FALLIDO" : "RESUMEN DE MISIÓN";
        const subColor = isVictory ? "#34d399" : isTimeout ? "#fde047" : "#94a3b8";
        drawArcadeText(ctx, subtitleText, centerX, modalY + 65, {
            size: 10.5,
            family: ARCADE_FONTS.HUD,
            italic: true,
            fill: subColor,
            strokeWidth: 2,
            glowBlur: 4,
            glowColor: subColor,
        });
        // Cuadrícula de Estadísticas Biselada
        const statsY = modalY + 95;
        drawChamferPanel(ctx, centerX - 120, statsY, 240, 130, 8, {
            fillColor: "rgba(15, 23, 48, 0.9)",
            strokeColor: "rgba(0, 229, 255, 0.35)",
            lineWidth: 1.2,
            glowBlur: 0,
            drawBrackets: false,
        });
        // Filas de estadísticas
        const rowY1 = statsY + 28;
        const rowY2 = statsY + 56;
        const rowY3 = statsY + 84;
        const rowY4 = statsY + 110;
        // Etiquetas a la izquierda
        drawArcadeText(ctx, "🥕 Zanahorias:", centerX - 100, rowY1, {
            size: 11,
            family: ARCADE_FONTS.HUD,
            align: "left",
            fill: "#e2e8f0",
            strokeWidth: 2,
            glowBlur: 0,
        });
        drawArcadeText(ctx, "🏁 Vueltas:", centerX - 100, rowY2, {
            size: 11,
            family: ARCADE_FONTS.HUD,
            align: "left",
            fill: "#e2e8f0",
            strokeWidth: 2,
            glowBlur: 0,
        });
        drawArcadeText(ctx, "⚡ Tiempo Restante:", centerX - 100, rowY3, {
            size: 11,
            family: ARCADE_FONTS.HUD,
            align: "left",
            fill: "#e2e8f0",
            strokeWidth: 2,
            glowBlur: 0,
        });
        drawArcadeText(ctx, "👾 Villanos:", centerX - 100, rowY4, {
            size: 11,
            family: ARCADE_FONTS.HUD,
            align: "left",
            fill: "#e2e8f0",
            strokeWidth: 2,
            glowBlur: 0,
        });
        // Valores a la derecha con acabado digital
        drawArcadeText(ctx, `+${stats.carrots}`, centerX + 100, rowY1, {
            size: 12,
            family: ARCADE_FONTS.DIGITAL,
            align: "right",
            fill: ["#ffffff", "#fbbf24"],
            strokeWidth: 2.5,
            glowColor: "#fbbf24",
            glowBlur: 4,
        });
        drawArcadeText(ctx, `${stats.lap}`, centerX + 100, rowY2, {
            size: 12,
            family: ARCADE_FONTS.DIGITAL,
            align: "right",
            fill: ["#ffffff", "#38bdf8"],
            strokeWidth: 2.5,
            glowColor: "#38bdf8",
            glowBlur: 4,
        });
        drawArcadeText(ctx, `${(stats.timeRemaining ?? 0).toFixed(1)}s`, centerX + 100, rowY3, {
            size: 12,
            family: ARCADE_FONTS.DIGITAL,
            align: "right",
            fill: isVictory ? ["#ffffff", "#10b981"] : ["#ffffff", "#f87171"],
            strokeWidth: 2.5,
            glowColor: isVictory ? "#10b981" : "#ef4444",
            glowBlur: 4,
        });
        drawArcadeText(ctx, `${stats.enemiesZapped}`, centerX + 100, rowY4, {
            size: 12,
            family: ARCADE_FONTS.DIGITAL,
            align: "right",
            fill: ["#ffffff", "#c084fc"],
            strokeWidth: 2.5,
            glowColor: "#c084fc",
            glowBlur: 4,
        });
        // Botón 1: [ ⏩ SIGUIENTE NIVEL ] o [ 🔄 REINTENTAR ]
        const btnW = 200;
        const btnH = 50;
        drawChamferPanel(ctx, centerX - btnW / 2, 390, btnW, btnH, 10, {
            fillColor: isVictory ? "#059669" : "#0284c7",
            strokeColor: isVictory ? "#34d399" : "#38bdf8",
            lineWidth: 2,
            glowColor: isVictory ? "rgba(52, 211, 153, 0.5)" : "rgba(56, 189, 248, 0.5)",
            glowBlur: 10,
            drawBrackets: true,
        });
        drawArcadeText(ctx, isVictory ? "⏩ SIGUIENTE NIVEL" : "🔄 REINTENTAR", centerX, 415, {
            size: 13,
            family: ARCADE_FONTS.HUD,
            italic: true,
            fill: "#ffffff",
            strokeWidth: 3,
            glowBlur: 4,
            glowColor: "#ffffff",
        });
        // Botón 2: [ 🏠 MENÚ PRINCIPAL ]
        drawChamferPanel(ctx, centerX - btnW / 2, 455, btnW, 46, 8, {
            fillColor: "#1e293b",
            strokeColor: "rgba(255, 255, 255, 0.25)",
            lineWidth: 1.2,
            glowBlur: 0,
            drawBrackets: false,
        });
        drawArcadeText(ctx, "🏠 MENÚ PRINCIPAL", centerX, 478, {
            size: 12,
            family: ARCADE_FONTS.HUD,
            italic: true,
            fill: ["#ffffff", "#94a3b8"],
            strokeWidth: 2.5,
            glowBlur: 0,
        });
        ctx.restore();
    }
}
