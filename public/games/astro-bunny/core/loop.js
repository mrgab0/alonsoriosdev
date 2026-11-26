export class GameLoop {
    onUpdate;
    onRender;
    static FIXED_STEP = 1 / 60; // 60 Hz física fija
    static MAX_ACCUMULATOR = 0.25; // Evita la espiral de muerte en caídas de framerate
    lastTime = 0;
    accumulator = 0;
    isRunning = false;
    isPaused = false;
    animFrameId = null;
    constructor(onUpdate, onRender) {
        this.onUpdate = onUpdate;
        this.onRender = onRender;
    }
    start() {
        if (this.isRunning)
            return;
        this.isRunning = true;
        this.isPaused = false;
        this.lastTime = performance.now();
        this.accumulator = 0;
        this.animFrameId = requestAnimationFrame(this.step);
    }
    stop() {
        this.isRunning = false;
        if (this.animFrameId !== null) {
            cancelAnimationFrame(this.animFrameId);
            this.animFrameId = null;
        }
    }
    pause() {
        this.isPaused = true;
    }
    resume() {
        if (!this.isPaused)
            return;
        this.isPaused = false;
        this.lastTime = performance.now();
        this.accumulator = 0;
    }
    step = (currentTime) => {
        if (!this.isRunning)
            return;
        if (this.isPaused) {
            this.lastTime = currentTime;
            this.animFrameId = requestAnimationFrame(this.step);
            return;
        }
        let frameTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        if (frameTime > GameLoop.MAX_ACCUMULATOR) {
            frameTime = GameLoop.MAX_ACCUMULATOR;
        }
        this.accumulator += frameTime;
        while (this.accumulator >= GameLoop.FIXED_STEP) {
            this.onUpdate(GameLoop.FIXED_STEP);
            this.accumulator -= GameLoop.FIXED_STEP;
        }
        const interpolation = this.accumulator / GameLoop.FIXED_STEP;
        this.onRender(interpolation);
        this.animFrameId = requestAnimationFrame(this.step);
    };
}
