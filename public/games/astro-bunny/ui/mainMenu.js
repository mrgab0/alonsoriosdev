import { ARCADE_FONTS, drawArcadeText, drawChamferPanel } from "./arcadeTheme.js";
export class MainMenu {
    subState = "SPLASH";
    audioEnabled = true;
    handleTouch(clickX, clickY, width, height) {
        const centerX = width / 2;
        // ----------------------------------------------------
        // 1. CAPA: PORTADA INICIAL (SPLASH)
        // ----------------------------------------------------
        if (this.subState === "SPLASH") {
            // Tocar en cualquier zona de la pantalla avanza al Hub de Idle
            this.subState = "HUB";
            return null;
        }
        // ----------------------------------------------------
        // ----------------------------------------------------
        // 2. CAPA: MODAL DE AJUSTES
        // ----------------------------------------------------
        if (this.subState === "SETTINGS") {
            const modalX = 24;
            const modalY = 150;
            const modalW = 312;
            const modalH = 300;
            // Cerrar al tocar el fondo oscuro exterior (backdrop)
            if (clickX < modalX || clickX > modalX + modalW || clickY < modalY || clickY > modalY + modalH) {
                this.subState = "HUB";
                return null;
            }
            // Cerrar [✕] arriba a la derecha (caja holgada)
            if (clickX >= modalX + modalW - 60 && clickX <= modalX + modalW && clickY >= modalY && clickY <= modalY + 60) {
                this.subState = "HUB";
                return null;
            }
            // Botón Alternar Audio (caja holgada)
            if (clickX >= centerX - 100 && clickX <= centerX + 100 && clickY >= modalY + 95 && clickY <= modalY + 175) {
                this.audioEnabled = !this.audioEnabled;
                return "TOGGLE_AUDIO";
            }
            // Botón Guardar y Volver al Hub (caja holgada)
            if (clickX >= centerX - 100 && clickX <= centerX + 100 && clickY >= modalY + 195 && clickY <= modalY + 275) {
                this.subState = "HUB";
                return null;
            }
            return null;
        }
        // ----------------------------------------------------
        // 3. CAPA: MODALES INFORMATIVOS (TÉRMINOS, CRÉDITOS, OTROS JUEGOS)
        // ----------------------------------------------------
        if (this.subState === "TERMS" || this.subState === "CREDITS" || this.subState === "OTHER_GAMES") {
            const modalX = 20;
            const modalY = 100;
            const modalW = 320;
            const modalH = 430;
            // Cerrar al tocar el fondo oscuro exterior (backdrop)
            if (clickX < modalX || clickX > modalX + modalW || clickY < modalY || clickY > modalY + modalH) {
                this.subState = "HUB";
                return null;
            }
            // Cerrar [✕] arriba a la derecha (caja holgada)
            if (clickX >= 270 && clickX <= 340 && clickY >= modalY && clickY <= modalY + 60) {
                this.subState = "HUB";
                return null;
            }
            // Botón inferior "Cerrar" (caja holgada)
            if (clickX >= centerX - 90 && clickX <= centerX + 90 && clickY >= 455 && clickY <= 535) {
                this.subState = "HUB";
                return null;
            }
            return null;
        }
        // ----------------------------------------------------
        // 4. CAPA: HUB DE IDLE (PANTALLA PRINCIPAL)
        // ----------------------------------------------------
        // A) Botones Centrales (Hitboxes continuas: CERO zonas muertas)
        const btnLeft = centerX - 120;
        const btnRight = centerX + 120;
        if (clickX >= btnLeft && clickX <= btnRight) {
            // 1. [ 🚀 INICIAR PARTIDA ] (y: 205 a 268, centrado en 238) -> Abre selección de nivel
            if (clickY >= 205 && clickY < 268) {
                return "START_GAME";
            }
            // 2. [ ⏩ CONTINUAR ] (y: 268 a 328, centrado en 298) -> Entra directo a la carrera
            if (clickY >= 268 && clickY < 328) {
                return "CONTINUE";
            }
            // 3. [ ⚙️ AJUSTES ] (y: 328 a 388, centrado en 358)
            if (clickY >= 328 && clickY < 388) {
                this.subState = "SETTINGS";
                return null;
            }
            // 4. [ 🚪 SALIR ] (y: 388 a 455, centrado en 418) -> Vuelve a la portada
            if (clickY >= 388 && clickY <= 455) {
                this.subState = "SPLASH";
                return null;
            }
        }
        // B) Botones Esquineros (Hitboxes holgadas)
        // Esquina Superior Izquierda: [ 🛍️ SKINS ]
        if (clickX >= 10 && clickX <= 125 && clickY >= 10 && clickY <= 55) {
            return "OPEN_SKINS";
        }
        // Esquina Superior Derecha: [ 🎮 OTROS JUEGOS ]
        if (clickX >= width - 130 && clickY >= 10 && clickY <= 55) {
            this.subState = "OTHER_GAMES";
            return null;
        }
        // Esquina Inferior Izquierda: [ 📜 TÉRMINOS ]
        if (clickX >= 0 && clickX <= 130 && clickY >= height - 65 && clickY <= height) {
            this.subState = "TERMS";
            return null;
        }
        // Esquina Inferior Derecha: [ 🎖️ CRÉDITOS ]
        if (clickX >= width - 130 && clickX <= width && clickY >= height - 65 && clickY <= height) {
            this.subState = "CREDITS";
            return null;
        }
        return null;
        return null;
    }
    render(ctx, width, height, totalCarrots, currentChapterTitle) {
        ctx.save();
        const now = performance.now();
        if (this.subState === "SPLASH") {
            this.renderSplashScreen(ctx, width, height, now);
        }
        else {
            this.renderHubScreen(ctx, width, height, totalCarrots, currentChapterTitle);
            if (this.subState === "SETTINGS") {
                this.renderSettingsModal(ctx, width, height);
            }
            else if (this.subState === "TERMS") {
                this.renderTermsModal(ctx, width, height);
            }
            else if (this.subState === "CREDITS") {
                this.renderCreditsModal(ctx, width, height);
            }
            else if (this.subState === "OTHER_GAMES") {
                this.renderOtherGamesModal(ctx, width, height);
            }
        }
        ctx.restore();
    }
    // ====================================================
    // RENDER 1: PANTALLA INICIAL (SPLASH)
    // ====================================================
    renderSplashScreen(ctx, width, height, now) {
        const centerX = width / 2;
        // Logotipo monumental iluminado arcade
        drawArcadeText(ctx, "ASTRO BUNNY", centerX, 175, {
            size: 34,
            family: ARCADE_FONTS.TITLE,
            italic: true,
            fill: ["#ffffff", "#00e5ff"],
            strokeWidth: 4.5,
            glowColor: "#00e5ff",
            glowBlur: Math.sin(now * 0.003) * 6 + 14,
        });
        drawArcadeText(ctx, "★ SPACE GP ★", centerX, 212, {
            size: 18,
            family: ARCADE_FONTS.TITLE,
            italic: true,
            fill: ["#ffffff", "#ff0077"],
            strokeWidth: 3.5,
            glowColor: "#ff0077",
            glowBlur: 12,
        });
        // Insignia Arcade Retro Biselada
        drawChamferPanel(ctx, centerX - 100, 240, 200, 28, 6, {
            fillColor: "rgba(15, 23, 42, 0.75)",
            strokeColor: "rgba(0, 229, 255, 0.35)",
            lineWidth: 1,
            drawBrackets: false,
            glowBlur: 0,
        });
        drawArcadeText(ctx, "MICRO-ENGINE • 9:16 SHORTS", centerX, 254, {
            size: 9.5,
            family: ARCADE_FONTS.HUD,
            fill: ["#ffffff", "#38bdf8"],
            strokeWidth: 2,
            glowBlur: 0,
        });
        // Texto pulsante "TOCA PARA CONTINUAR"
        const pulseAlpha = Math.sin(now * 0.005) * 0.35 + 0.65;
        drawArcadeText(ctx, "✨ TOCA PARA CONTINUAR ✨", centerX, 440, {
            size: 13.5,
            family: ARCADE_FONTS.HUD,
            italic: true,
            fill: `rgba(255, 255, 255, ${pulseAlpha})`,
            strokeWidth: 2.5,
            glowColor: "rgba(255, 255, 255, 0.6)",
            glowBlur: 8,
        });
        drawArcadeText(ctx, "INSERT COIN TO RACE", centerX, 465, {
            size: 10,
            family: ARCADE_FONTS.DIGITAL,
            fill: "rgba(0, 229, 255, 0.8)",
            strokeWidth: 1.5,
            glowBlur: 4,
        });
        // Pie de página
        ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
        ctx.font = "10px monospace";
        ctx.textAlign = "center";
        ctx.fillText("YouTube Playables v1 • DeepMind Autopilot", centerX, height - 20);
    }
    // ====================================================
    // RENDER 2: HUB PRINCIPAL DE IDLE
    // ====================================================
    renderHubScreen(ctx, width, height, totalCarrots, currentChapterTitle) {
        const centerX = width / 2;
        // 1. Título Compacto Superior Arcade
        drawArcadeText(ctx, "ASTRO BUNNY", centerX, 114, {
            size: 22,
            family: ARCADE_FONTS.TITLE,
            italic: true,
            fill: ["#ffffff", "#00e5ff"],
            strokeWidth: 3.5,
            glowColor: "#00e5ff",
            glowBlur: 8,
        });
        drawArcadeText(ctx, "★ SPACE GP ★", centerX, 134, {
            size: 11.5,
            family: ARCADE_FONTS.TITLE,
            italic: true,
            fill: ["#ffffff", "#ff0077"],
            strokeWidth: 2.5,
            glowColor: "#ff0077",
            glowBlur: 6,
        });
        // 2. Tarjeta de Estado (Zanahorias y Mundo Activo) Biselada
        const cardY = 152;
        drawChamferPanel(ctx, centerX - 120, cardY, 240, 48, 8, {
            fillColor: "rgba(15, 23, 42, 0.85)",
            strokeColor: "rgba(0, 229, 255, 0.35)",
            lineWidth: 1.2,
            drawBrackets: false,
            glowBlur: 0,
        });
        drawArcadeText(ctx, `🥕 Zanahorias: ${totalCarrots}`, centerX - 105, cardY + 16, {
            size: 11,
            family: ARCADE_FONTS.HUD,
            align: "left",
            fill: ["#ffffff", "#fbbf24"],
            strokeWidth: 2,
            glowBlur: 0,
        });
        drawArcadeText(ctx, `🪐 ${currentChapterTitle}`, centerX - 105, cardY + 34, {
            size: 10,
            family: ARCADE_FONTS.HUD,
            align: "left",
            fill: ["#ffffff", "#38bdf8"],
            strokeWidth: 2,
            glowBlur: 0,
        });
        // 3. Botones Centrales Biselados
        const btnW = 230;
        const btnH = 46;
        const btnLeft = centerX - btnW / 2;
        // A) [ 🚀 INICIAR PARTIDA ] (Abre selección de nivel)
        drawChamferPanel(ctx, btnLeft, 215, btnW, btnH, 8, {
            fillColor: "#0284c7",
            strokeColor: "#38bdf8",
            lineWidth: 2,
            glowColor: "rgba(56, 189, 248, 0.4)",
            glowBlur: 8,
            drawBrackets: true,
        });
        drawArcadeText(ctx, "🚀 INICIAR PARTIDA", centerX, 238, {
            size: 13,
            family: ARCADE_FONTS.HUD,
            italic: true,
            fill: "#ffffff",
            strokeWidth: 2.5,
            glowBlur: 4,
        });
        // B) [ ⏩ CONTINUAR ] (Entra de inmediato)
        drawChamferPanel(ctx, btnLeft, 275, btnW, btnH, 8, {
            fillColor: "rgba(16, 185, 129, 0.25)",
            strokeColor: "#10b981",
            lineWidth: 1.6,
            drawBrackets: true,
        });
        drawArcadeText(ctx, "⏩ CONTINUAR", centerX, 298, {
            size: 13,
            family: ARCADE_FONTS.HUD,
            italic: true,
            fill: ["#ffffff", "#34d399"],
            strokeWidth: 2.5,
            glowBlur: 4,
        });
        // C) [ ⚙️ AJUSTES ]
        drawChamferPanel(ctx, btnLeft, 335, btnW, btnH, 8, {
            fillColor: "rgba(30, 41, 59, 0.85)",
            strokeColor: "rgba(255, 255, 255, 0.25)",
            lineWidth: 1.2,
            drawBrackets: false,
        });
        drawArcadeText(ctx, "⚙️ AJUSTES", centerX, 358, {
            size: 13,
            family: ARCADE_FONTS.HUD,
            italic: true,
            fill: "#cbd5e1",
            strokeWidth: 2,
            glowBlur: 0,
        });
        // D) [ 🚪 SALIR ]
        drawChamferPanel(ctx, btnLeft, 395, btnW, btnH, 8, {
            fillColor: "rgba(30, 41, 59, 0.85)",
            strokeColor: "rgba(244, 63, 94, 0.4)",
            lineWidth: 1.2,
            drawBrackets: false,
        });
        drawArcadeText(ctx, "🚪 SALIR", centerX, 418, {
            size: 13,
            family: ARCADE_FONTS.HUD,
            italic: true,
            fill: ["#ffffff", "#f87171"],
            strokeWidth: 2,
            glowBlur: 0,
        });
        // 4. Botones Esquineros Biselados
        // Esquina Superior Izquierda: [ 🛍️ SKINS ]
        drawChamferPanel(ctx, 12, 14, 98, 32, 6, {
            fillColor: "rgba(15, 23, 42, 0.75)",
            strokeColor: "#f59e0b",
            lineWidth: 1.2,
            drawBrackets: false,
        });
        drawArcadeText(ctx, "🛍️ SKINS", 61, 30, {
            size: 10,
            family: ARCADE_FONTS.HUD,
            fill: "#fbbf24",
            strokeWidth: 2,
            glowBlur: 0,
        });
        // Esquina Superior Derecha: [ 🎮 Otros Juegos ]
        drawChamferPanel(ctx, width - 118, 14, 106, 32, 6, {
            fillColor: "rgba(15, 23, 42, 0.75)",
            strokeColor: "#a855f7",
            lineWidth: 1,
            drawBrackets: false,
        });
        drawArcadeText(ctx, "🎮 OTROS JUEGOS", width - 65, 30, {
            size: 9.5,
            family: ARCADE_FONTS.HUD,
            fill: "#c084fc",
            strokeWidth: 2,
            glowBlur: 0,
        });
        // Esquina Inferior Izquierda: [ 📜 Términos ]
        drawChamferPanel(ctx, 10, height - 52, 98, 36, 6, {
            fillColor: "rgba(15, 23, 42, 0.75)",
            strokeColor: "rgba(255, 255, 255, 0.2)",
            lineWidth: 1,
            drawBrackets: false,
        });
        drawArcadeText(ctx, "📜 TÉRMINOS", 59, height - 34, {
            size: 9.5,
            family: ARCADE_FONTS.HUD,
            fill: "#94a3b8",
            strokeWidth: 2,
            glowBlur: 0,
        });
        // Esquina Inferior Derecha: [ 🎖️ Créditos ]
        drawChamferPanel(ctx, width - 108, height - 52, 98, 36, 6, {
            fillColor: "rgba(15, 23, 42, 0.75)",
            strokeColor: "rgba(255, 255, 255, 0.2)",
            lineWidth: 1,
            drawBrackets: false,
        });
        drawArcadeText(ctx, "🎖️ CRÉDITOS", width - 59, height - 34, {
            size: 9.5,
            family: ARCADE_FONTS.HUD,
            fill: "#94a3b8",
            strokeWidth: 2,
            glowBlur: 0,
        });
    }
    // ====================================================
    // MODAL: AJUSTES
    // ====================================================
    renderSettingsModal(ctx, width, height) {
        const modalX = 24;
        const modalY = 150;
        const modalW = 312;
        const modalH = 300;
        const centerX = width / 2;
        this.renderModalFrame(ctx, width, height, modalX, modalY, modalW, modalH, "⚙️ AJUSTES DEL JUEGO");
        // Botón Audio ON / OFF
        ctx.fillStyle = this.audioEnabled ? "rgba(16, 185, 129, 0.25)" : "rgba(239, 68, 68, 0.25)";
        ctx.strokeStyle = this.audioEnabled ? "#10b981" : "#ef4444";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(centerX - 90, modalY + 110, 180, 50, 12);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = this.audioEnabled ? "#34d399" : "#f87171";
        ctx.font = "bold 15px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(this.audioEnabled ? "🔊 SONIDO: ACTIVADO" : "🔇 SONIDO: MUTED", centerX, modalY + 140);
        // Botón Aceptar / Cerrar
        ctx.fillStyle = "#0284c7";
        ctx.strokeStyle = "#38bdf8";
        ctx.beginPath();
        ctx.roundRect(centerX - 90, modalY + 210, 180, 46, 12);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 14px system-ui, sans-serif";
        ctx.fillText("GUARDAR Y VOLVER", centerX, modalY + 238);
    }
    // ====================================================
    // MODAL: TÉRMINOS Y PRIVACIDAD
    // ====================================================
    renderTermsModal(ctx, width, height) {
        const modalX = 20;
        const modalY = 100;
        const modalW = 320;
        const modalH = 430;
        const centerX = width / 2;
        this.renderModalFrame(ctx, width, height, modalX, modalY, modalW, modalH, "📜 TÉRMINOS Y CONDICIONES");
        ctx.textAlign = "left";
        ctx.font = "11px system-ui, -apple-system, sans-serif";
        ctx.fillStyle = "#cbd5e1";
        const lines = [
            "• Conforme con las Políticas de YouTube Playables v1.",
            "• Juego gratuito sin microtransacciones de dinero real.",
            "• No recopila datos personales privados ni ubicación.",
            "• Los datos de progreso se almacenan mediante",
            "  la API oficial ytgame.game.saveData de YouTube.",
            "• Contenido apto para todas las edades (All Ages).",
            "• Prohibida la redistribución no autorizada."
        ];
        let textY = modalY + 80;
        for (const line of lines) {
            ctx.fillText(line, modalX + 22, textY);
            textY += 24;
        }
        this.renderModalCloseButton(ctx, centerX, modalY + modalH - 55);
    }
    // ====================================================
    // MODAL: CRÉDITOS
    // ====================================================
    renderCreditsModal(ctx, width, height) {
        const modalX = 20;
        const modalY = 100;
        const modalW = 320;
        const modalH = 430;
        const centerX = width / 2;
        this.renderModalFrame(ctx, width, height, modalX, modalY, modalW, modalH, "🎖️ CRÉDITOS");
        ctx.textAlign = "center";
        ctx.fillStyle = "#38bdf8";
        ctx.font = "bold 14px system-ui, sans-serif";
        ctx.fillText("ASTRO BUNNY SPACE GP", centerX, modalY + 75);
        ctx.fillStyle = "#94a3b8";
        ctx.font = "11px system-ui, sans-serif";
        ctx.fillText("Diseño y Lógica de Videojuego", centerX, modalY + 98);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 13px system-ui, sans-serif";
        ctx.fillText("Astro Bunny Dev Team", centerX, modalY + 118);
        ctx.fillStyle = "#94a3b8";
        ctx.font = "11px system-ui, sans-serif";
        ctx.fillText("Arquitectura & Micro-Engine TypeScript", centerX, modalY + 155);
        ctx.fillStyle = "#00e5ff";
        ctx.font = "bold 13px system-ui, sans-serif";
        ctx.fillText("DeepMind Antigravity Autopilot", centerX, modalY + 175);
        ctx.fillStyle = "#94a3b8";
        ctx.font = "11px system-ui, sans-serif";
        ctx.fillText("Inspiración Mecánica y Arte", centerX, modalY + 215);
        ctx.fillStyle = "#ff0077";
        ctx.font = "bold 12px monospace";
        ctx.fillText("Turbo Kids • Contra III: The Alien Wars", centerX, modalY + 235);
        this.renderModalCloseButton(ctx, centerX, modalY + modalH - 55);
    }
    // ====================================================
    // MODAL: OTROS JUEGOS
    // ====================================================
    renderOtherGamesModal(ctx, width, height) {
        const modalX = 20;
        const modalY = 100;
        const modalW = 320;
        const modalH = 430;
        const centerX = width / 2;
        this.renderModalFrame(ctx, width, height, modalX, modalY, modalW, modalH, "🎮 OTROS JUEGOS ASTRO");
        const games = [
            { title: "🤖 Cyber Mecha GP", subtitle: "Carreras con exoesqueletos cósmicos", status: "Próximamente" },
            { title: "🌌 Deep Cosmos Odyssey", subtitle: "Aventura orbital roguelike", status: "En desarrollo" },
            { title: "🐰 Astro Runner Zero", subtitle: "El clásico arcade de plataformas", status: "Disponible" }
        ];
        let cardY = modalY + 75;
        for (const g of games) {
            ctx.fillStyle = "#131a35";
            ctx.strokeStyle = "rgba(192, 132, 252, 0.35)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(modalX + 16, cardY, modalW - 32, 54, 8);
            ctx.fill();
            ctx.stroke();
            ctx.textAlign = "left";
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 13px system-ui, sans-serif";
            ctx.fillText(g.title, modalX + 28, cardY + 22);
            ctx.fillStyle = "#94a3b8";
            ctx.font = "10px system-ui, sans-serif";
            ctx.fillText(g.subtitle, modalX + 28, cardY + 40);
            ctx.textAlign = "right";
            ctx.fillStyle = g.status === "Disponible" ? "#34d399" : "#c084fc";
            ctx.font = "bold 10px monospace";
            ctx.fillText(g.status, modalX + modalW - 28, cardY + 31);
            cardY += 66;
        }
        this.renderModalCloseButton(ctx, centerX, modalY + modalH - 55);
    }
    // ====================================================
    // HELPERS DE MODAL
    // ====================================================
    renderModalFrame(ctx, width, height, x, y, w, h, title) {
        // Oscurecimiento de fondo
        ctx.fillStyle = "rgba(1, 2, 8, 0.88)";
        ctx.fillRect(0, 0, width, height);
        // Caja de modal
        ctx.fillStyle = "#090d1e";
        ctx.strokeStyle = "#00e5ff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 16);
        ctx.fill();
        ctx.stroke();
        // Título
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 15px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(title, width / 2, y + 34);
        // Botón Cerrar [✕]
        ctx.fillStyle = "#94a3b8";
        ctx.font = "bold 16px sans-serif";
        ctx.fillText("✕", x + w - 24, y + 32);
    }
    renderModalCloseButton(ctx, centerX, y) {
        ctx.fillStyle = "#1e293b";
        ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(centerX - 80, y, 160, 42, 10);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 13px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("CERRAR", centerX, y + 26);
    }
}
