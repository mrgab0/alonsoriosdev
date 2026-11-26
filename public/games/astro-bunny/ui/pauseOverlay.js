import { ARCADE_FONTS, drawArcadeText, drawChamferPanel } from "./arcadeTheme.js";
export class PauseOverlay {
    handleTouch(clickX, clickY, width) {
        const centerX = width / 2;
        // Tocar el fondo exterior (backdrop) reanuda el juego
        if (clickY < 180 || clickY > 480 || clickX < centerX - 130 || clickX > centerX + 130) {
            return "RESUME";
        }
        // Botones con hitboxes continuas (cero zonas muertas)
        if (clickX >= centerX - 110 && clickX <= centerX + 110) {
            // 1. REANUDAR: y: 255 a 325 (centrado en 290)
            if (clickY >= 255 && clickY < 325) {
                return "RESUME";
            }
            // 2. REINICIAR: y: 325 a 390 (centrado en 358)
            if (clickY >= 325 && clickY < 390) {
                return "RESTART";
            }
            // 3. MENÚ: y: 390 a 460 (centrado en 425)
            if (clickY >= 390 && clickY <= 460) {
                return "MENU";
            }
        }
        return null;
    }
    render(ctx, width, height) {
        ctx.save();
        // Fondo oscurecido con viñeta arcade
        ctx.fillStyle = "rgba(1, 2, 8, 0.88)";
        ctx.fillRect(0, 0, width, height);
        const centerX = width / 2;
        const modalY = 180;
        const modalW = 264;
        const modalH = 300;
        // Caja de Pausa estilo cabina táctica biselada
        drawChamferPanel(ctx, centerX - modalW / 2, modalY, modalW, modalH, 14, {
            fillColor: "rgba(11, 18, 42, 0.95)",
            strokeColor: "#00e5ff",
            lineWidth: 2,
            glowColor: "rgba(0, 229, 255, 0.4)",
            glowBlur: 12,
            drawBrackets: true,
        });
        // Título PAUSA
        drawArcadeText(ctx, "⏸ JUEGO EN PAUSA", centerX, modalY + 45, {
            size: 16,
            family: ARCADE_FONTS.TITLE,
            italic: true,
            fill: ["#ffffff", "#00e5ff"],
            strokeWidth: 3,
            glowColor: "#00e5ff",
            glowBlur: 8,
        });
        // 1. Botón REANUDAR
        drawChamferPanel(ctx, centerX - 100, 270, 200, 50, 8, {
            fillColor: "#0284c7",
            strokeColor: "#38bdf8",
            lineWidth: 1.5,
            glowBlur: 8,
            glowColor: "rgba(56, 189, 248, 0.4)",
            drawBrackets: true,
        });
        drawArcadeText(ctx, "▶ REANUDAR", centerX, 295, {
            size: 13,
            family: ARCADE_FONTS.HUD,
            italic: true,
            fill: "#ffffff",
            strokeWidth: 2.5,
            glowBlur: 4,
        });
        // 2. Botón REINICIAR
        drawChamferPanel(ctx, centerX - 100, 335, 200, 50, 8, {
            fillColor: "#1e293b",
            strokeColor: "rgba(255, 255, 255, 0.25)",
            lineWidth: 1.2,
            glowBlur: 0,
            drawBrackets: false,
        });
        drawArcadeText(ctx, "🔄 REINICIAR", centerX, 360, {
            size: 13,
            family: ARCADE_FONTS.HUD,
            italic: true,
            fill: "#e2e8f0",
            strokeWidth: 2.5,
            glowBlur: 0,
        });
        // 3. Botón SALIR AL MENÚ
        drawChamferPanel(ctx, centerX - 100, 400, 200, 50, 8, {
            fillColor: "#1e293b",
            strokeColor: "rgba(244, 63, 94, 0.3)",
            lineWidth: 1.2,
            glowBlur: 0,
            drawBrackets: false,
        });
        drawArcadeText(ctx, "🏠 MENÚ PRINCIPAL", centerX, 425, {
            size: 13,
            family: ARCADE_FONTS.HUD,
            italic: true,
            fill: ["#ffffff", "#f87171"],
            strokeWidth: 2.5,
            glowBlur: 0,
        });
        ctx.restore();
    }
}
