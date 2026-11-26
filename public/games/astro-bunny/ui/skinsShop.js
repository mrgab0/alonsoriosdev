import { StorageManager } from "../platform/storage.js";
import { drawArcadeText, ARCADE_FONTS } from "./arcadeTheme.js";
export const SKINS_CATALOG = [
    {
        id: "classic_rabbit",
        name: "Classic Bunny",
        description: "Explorador estelar original. Traje ágil de fibra blanca.",
        cost: 0,
        primaryColor: "#ffffff",
        accentColor: "#38bdf8"
    },
    {
        id: "rocket_mogul",
        name: "Rocket Mogul",
        description: "Magnate galáctico. Chaqueta oscura y gafas de aviador doradas.",
        cost: 100,
        primaryColor: "#1e293b",
        accentColor: "#f59e0b"
    },
    {
        id: "cosmic_senator",
        name: "Cosmic Senator",
        description: "Político intergaláctico con toga púrpura y visor holográfico.",
        cost: 250,
        primaryColor: "#581c87",
        accentColor: "#c084fc"
    },
    {
        id: "cyber_champion",
        name: "Cyber Champion",
        description: "Armadura de titanio dorado forjada en supernovas.",
        cost: 500,
        primaryColor: "#fbbf24",
        accentColor: "#f43f5e"
    }
];
export class SkinsShop {
    active = false;
    message = "";
    messageTimer = 0;
    isOpen() {
        return this.active;
    }
    open() {
        this.active = true;
        this.message = "";
        this.messageTimer = 0;
    }
    close() {
        this.active = false;
    }
    update(dt) {
        if (this.messageTimer > 0) {
            this.messageTimer -= dt;
            if (this.messageTimer <= 0) {
                this.message = "";
            }
        }
    }
    handlePointer(x, y, width, _height, isClick) {
        if (!this.active || !isClick)
            return false;
        // 1. Botón Volver / Cerrar (Esquina superior izquierda)
        const backBtnX = 16;
        const backBtnY = 16;
        const backBtnW = 90;
        const backBtnH = 36;
        if (x >= backBtnX && x <= backBtnX + backBtnW && y >= backBtnY && y <= backBtnY + backBtnH) {
            this.close();
            return true;
        }
        const storage = StorageManager.getInstance();
        const data = storage.getData();
        const totalCarrots = data.cosmicCarrots || 0;
        const currentSkin = data.selectedSkin || "classic_rabbit";
        // 2. Tarjetas de skins
        const startY = 105;
        const cardH = 80;
        const spacing = 12;
        const cardW = Math.min(width - 32, 400);
        const cardX = (width - cardW) / 2;
        for (let i = 0; i < SKINS_CATALOG.length; i++) {
            const skin = SKINS_CATALOG[i];
            const cy = startY + i * (cardH + spacing);
            if (y >= cy && y <= cy + cardH && x >= cardX && x <= cardX + cardW) {
                const isUnlocked = storage.isSkinUnlocked(skin.id);
                if (isUnlocked) {
                    if (currentSkin !== skin.id) {
                        storage.selectSkin(skin.id);
                        this.message = `¡${skin.name} equipado!`;
                        this.messageTimer = 1.8;
                    }
                }
                else {
                    // Intentar comprar
                    if (storage.spendCarrots(skin.cost)) {
                        storage.unlockSkin(skin.id);
                        storage.selectSkin(skin.id);
                        this.message = `¡${skin.name} desbloqueado!`;
                        this.messageTimer = 2.0;
                    }
                    else {
                        this.message = `¡Te faltan ${skin.cost - totalCarrots} zanahorias!`;
                        this.messageTimer = 2.0;
                    }
                }
                return true;
            }
        }
        return true; // Captura el click para no filtrarlo al juego
    }
    render(ctx, width, height) {
        if (!this.active)
            return;
        ctx.save();
        // Fondo degradado espacial translúcido
        const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
        bgGrad.addColorStop(0, "rgba(10, 15, 30, 0.96)");
        bgGrad.addColorStop(1, "rgba(5, 7, 18, 0.98)");
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);
        const storage = StorageManager.getInstance();
        const data = storage.getData();
        const totalCarrots = data.cosmicCarrots || 0;
        const currentSkin = data.selectedSkin || "classic_rabbit";
        // 1. Botón Volver
        const backBtnX = 16;
        const backBtnY = 16;
        const backBtnW = 90;
        const backBtnH = 34;
        ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect(backBtnX, backBtnY, backBtnW, backBtnH, 8);
        ctx.fill();
        ctx.stroke();
        drawArcadeText(ctx, "◀ VOLVER", backBtnX + 12, backBtnY + 11, {
            size: 11,
            family: ARCADE_FONTS.HUD,
            fill: "#e2e8f0"
        });
        // 2. Contador de Zanahorias en la barra superior derecha
        const carrotText = `🥕 ${totalCarrots}`;
        drawArcadeText(ctx, carrotText, width - 110, backBtnY + 11, {
            size: 12,
            family: ARCADE_FONTS.HUD,
            fill: "#fbbf24"
        });
        // 3. Título de la Tienda
        drawArcadeText(ctx, "TIENDA DE TRAJES", width / 2 - 85, 70, {
            size: 15,
            family: ARCADE_FONTS.TITLE,
            fill: "#38bdf8"
        });
        // 4. Mensaje temporal de feedback
        if (this.message) {
            ctx.textAlign = "center";
            ctx.font = "bold 12px system-ui";
            ctx.fillStyle = this.message.includes("faltan") ? "#ef4444" : "#10b981";
            ctx.fillText(this.message, width / 2, 92);
            ctx.textAlign = "start";
        }
        // 5. Lista de Tarjetas de Trajes
        const startY = 105;
        const cardH = 80;
        const spacing = 12;
        const cardW = Math.min(width - 32, 400);
        const cardX = (width - cardW) / 2;
        for (let i = 0; i < SKINS_CATALOG.length; i++) {
            const skin = SKINS_CATALOG[i];
            const cy = startY + i * (cardH + spacing);
            const isSelected = currentSkin === skin.id;
            const isUnlocked = storage.isSkinUnlocked(skin.id);
            ctx.save();
            // Marco de la tarjeta
            ctx.fillStyle = isSelected ? "rgba(56, 189, 248, 0.12)" : "rgba(30, 41, 59, 0.75)";
            ctx.strokeStyle = isSelected ? "#38bdf8" : isUnlocked ? "rgba(255, 255, 255, 0.18)" : "rgba(100, 116, 139, 0.3)";
            ctx.lineWidth = isSelected ? 2 : 1;
            ctx.beginPath();
            ctx.roundRect(cardX, cy, cardW, cardH, 12);
            ctx.fill();
            ctx.stroke();
            // Avatar / Icono circular de la skin
            const iconX = cardX + 34;
            const iconY = cy + cardH / 2;
            ctx.fillStyle = skin.primaryColor;
            ctx.beginPath();
            ctx.arc(iconX, iconY, 18, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = skin.accentColor;
            ctx.lineWidth = 2.5;
            ctx.stroke();
            // Visor miniatura dentro del avatar
            ctx.fillStyle = skin.accentColor;
            ctx.beginPath();
            ctx.arc(iconX + 3, iconY - 2, 7, 0, Math.PI * 2);
            ctx.fill();
            // Textos de la tarjeta
            const textX = iconX + 30;
            drawArcadeText(ctx, skin.name, textX, cy + 18, {
                size: 11,
                family: ARCADE_FONTS.TITLE,
                fill: isSelected ? "#38bdf8" : "#f8fafc"
            });
            ctx.fillStyle = "#94a3b8";
            ctx.font = "10px system-ui, sans-serif";
            ctx.fillText(skin.description.slice(0, 36) + "...", textX, cy + 42);
            // Botón de Estado a la derecha
            const btnW = 96;
            const btnH = 32;
            const btnX = cardX + cardW - btnW - 12;
            const btnY = cy + (cardH - btnH) / 2;
            ctx.save();
            if (isSelected) {
                ctx.fillStyle = "#10b981";
                ctx.beginPath();
                ctx.roundRect(btnX, btnY, btnW, btnH, 8);
                ctx.fill();
                ctx.fillStyle = "#ffffff";
                ctx.font = "bold 10px system-ui";
                ctx.textAlign = "center";
                ctx.fillText("✓ EQUIPADO", btnX + btnW / 2, btnY + 20);
            }
            else if (isUnlocked) {
                ctx.fillStyle = "rgba(56, 189, 248, 0.2)";
                ctx.strokeStyle = "#38bdf8";
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.roundRect(btnX, btnY, btnW, btnH, 8);
                ctx.fill();
                ctx.stroke();
                ctx.fillStyle = "#38bdf8";
                ctx.font = "bold 10px system-ui";
                ctx.textAlign = "center";
                ctx.fillText("EQUIPAR", btnX + btnW / 2, btnY + 20);
            }
            else {
                const canBuy = totalCarrots >= skin.cost;
                ctx.fillStyle = canBuy ? "rgba(245, 158, 11, 0.25)" : "rgba(71, 85, 105, 0.3)";
                ctx.strokeStyle = canBuy ? "#f59e0b" : "#475569";
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.roundRect(btnX, btnY, btnW, btnH, 8);
                ctx.fill();
                ctx.stroke();
                ctx.fillStyle = canBuy ? "#fbbf24" : "#94a3b8";
                ctx.font = "bold 10px system-ui";
                ctx.textAlign = "center";
                ctx.fillText(`🥕 ${skin.cost}`, btnX + btnW / 2, btnY + 20);
            }
            ctx.restore();
            ctx.restore();
        }
        ctx.restore();
    }
}
