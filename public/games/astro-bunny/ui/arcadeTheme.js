/**
 * Arcade Theme & Video Game Typography Engine
 * Provee tipografías de competición, contornos 3D con bisel y paneles angulares biselados.
 */
export const ARCADE_FONTS = {
    TITLE: "'Orbitron', 'Russo One', 'Impact', sans-serif",
    HUD: "'Chakra Petch', 'Orbitron', 'Impact', sans-serif",
    DIGITAL: "'Orbitron', monospace"
};
/**
 * Dibuja texto con relieve 3D, inclinación deportiva y contornos de alto contraste
 */
export function drawArcadeText(ctx, text, x, y, opts = {}) {
    const size = opts.size ?? 18;
    const family = opts.family ?? ARCADE_FONTS.TITLE;
    const italic = opts.italic ?? true;
    const weight = opts.weight ?? 900;
    const align = opts.align ?? "center";
    const baseline = opts.baseline ?? "middle";
    const strokeColor = opts.strokeColor ?? "#02040b";
    const strokeWidth = opts.strokeWidth ?? 3.5;
    const glowColor = opts.glowColor ?? "rgba(0, 229, 255, 0.5)";
    const glowBlur = opts.glowBlur ?? 8;
    const shadowY = opts.shadowY ?? 2.5;
    const shadowColor = opts.shadowColor ?? "rgba(0, 0, 0, 0.85)";
    ctx.save();
    ctx.font = `${italic ? "italic " : ""}${weight} ${size}px ${family}`;
    ctx.textAlign = align;
    ctx.textBaseline = baseline;
    // 1. Sombra 3D profunda
    if (shadowY > 0) {
        ctx.fillStyle = shadowColor;
        ctx.fillText(text, x, y + shadowY);
    }
    // 2. Contorno exterior oscuro grueso para separar el texto de los fondos
    if (strokeWidth > 0) {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;
        ctx.lineJoin = "miter";
        ctx.miterLimit = 2;
        ctx.strokeText(text, x, y);
    }
    // 3. Resplandor neón
    if (glowBlur > 0 && glowColor) {
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = glowBlur;
    }
    // 4. Relleno principal (Gradiente vertical o color sólido)
    if (Array.isArray(opts.fill)) {
        const half = size * 0.6;
        const grad = ctx.createLinearGradient(0, y - half, 0, y + half);
        grad.addColorStop(0, opts.fill[0]);
        grad.addColorStop(1, opts.fill[1]);
        ctx.fillStyle = grad;
    }
    else {
        ctx.fillStyle = opts.fill ?? "#ffffff";
    }
    ctx.fillText(text, x, y);
    ctx.restore();
}
/**
 * Dibuja un panel o marquesina estilo cabina espacial con cortes a 45 grados
 */
export function drawChamferPanel(ctx, x, y, w, h, chamfer = 8, opts = {}) {
    const strokeColor = opts.strokeColor ?? "#00e5ff";
    const lineWidth = opts.lineWidth ?? 1.5;
    const glowColor = opts.glowColor ?? "rgba(0, 229, 255, 0.4)";
    const glowBlur = opts.glowBlur ?? 10;
    const c = Math.min(chamfer, w / 4, h / 4);
    ctx.save();
    // Resplandor neón
    if (glowBlur > 0 && glowColor) {
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = glowBlur;
    }
    // Trayectoria biselada a 45°
    ctx.beginPath();
    ctx.moveTo(x + c, y);
    ctx.lineTo(x + w - c, y);
    ctx.lineTo(x + w, y + c);
    ctx.lineTo(x + w, y + h - c);
    ctx.lineTo(x + w - c, y + h);
    ctx.lineTo(x + c, y + h);
    ctx.lineTo(x, y + h - c);
    ctx.lineTo(x, y + c);
    ctx.closePath();
    // Relleno
    if (opts.fillColor) {
        ctx.fillStyle = opts.fillColor;
        ctx.fill();
    }
    else {
        // Fondo oscuro tecnológico predeterminado con degradado
        const grad = ctx.createLinearGradient(x, y, x, y + h);
        grad.addColorStop(0, "rgba(7, 14, 32, 0.92)");
        grad.addColorStop(1, "rgba(2, 6, 16, 0.95)");
        ctx.fillStyle = grad;
        ctx.fill();
    }
    // Borde
    if (lineWidth > 0 && strokeColor) {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
    }
    ctx.shadowBlur = 0;
    // Detalles de cabina: esquinas tácticas / corchetes
    if (opts.drawBrackets !== false) {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2.5;
        // Corner Top-Left
        ctx.beginPath();
        ctx.moveTo(x + 2, y + c + 8);
        ctx.lineTo(x + 2, y + c + 2);
        ctx.lineTo(x + c + 2, y + 2);
        ctx.lineTo(x + c + 8, y + 2);
        ctx.stroke();
        // Corner Bottom-Right
        ctx.beginPath();
        ctx.moveTo(x + w - 2, y + h - c - 8);
        ctx.lineTo(x + w - 2, y + h - c - 2);
        ctx.lineTo(x + w - c - 2, y + h - 2);
        ctx.lineTo(x + w - c - 8, y + h - 2);
        ctx.stroke();
    }
    ctx.restore();
}
