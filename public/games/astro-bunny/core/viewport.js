export class Viewport {
    static LOGICAL_WIDTH = 360;
    static LOGICAL_HEIGHT = 640;
    scale = 1.0;
    offsetX = 0;
    offsetY = 0;
    update(canvasWidth, canvasHeight) {
        const scaleX = canvasWidth / Viewport.LOGICAL_WIDTH;
        const scaleY = canvasHeight / Viewport.LOGICAL_HEIGHT;
        this.scale = Math.min(scaleX, scaleY);
        this.offsetX = (canvasWidth - Viewport.LOGICAL_WIDTH * this.scale) / 2;
        this.offsetY = (canvasHeight - Viewport.LOGICAL_HEIGHT * this.scale) / 2;
    }
    screenToLogical(clientX, clientY, canvas) {
        const rect = canvas.getBoundingClientRect();
        const canvasX = (clientX - rect.left) * (canvas.width / (rect.width || 1));
        const canvasY = (clientY - rect.top) * (canvas.height / (rect.height || 1));
        return {
            x: (canvasX - this.offsetX) / (this.scale || 1),
            y: (canvasY - this.offsetY) / (this.scale || 1)
        };
    }
    apply(ctx) {
        ctx.save();
        ctx.translate(this.offsetX, this.offsetY);
        ctx.scale(this.scale, this.scale);
    }
    restore(ctx) {
        ctx.restore();
    }
}
