export class InputManager {
    static instance;
    // Estados continuos
    left = false;
    right = false;
    jumpHeld = false;
    turboHeld = false;
    shootHeld = false;
    sliding = false;
    // Estados de flanco (un solo frame)
    jumpJustPressed = false;
    turboJustPressed = false;
    shootJustPressed = false;
    slideJustPressed = false;
    lastClick = null;
    // Herramienta Direccional Deslizable (-1.0 a +1.0)
    steerValue = 0;
    isSteering = false;
    isKeyboardActive = false;
    // Gestión táctil multitoque con tracking de inicio de arrastre
    activePointers = new Map();
    constructor() {
        this.setupKeyboardListeners();
        this.setupPointerListeners();
    }
    static getInstance() {
        if (!InputManager.instance) {
            InputManager.instance = new InputManager();
        }
        return InputManager.instance;
    }
    setupKeyboardListeners() {
        window.addEventListener("keydown", (e) => {
            // Regla estricta de YouTube Playables: NUNCA interceptar la tecla Escape
            if (e.key === "Escape") {
                return;
            }
            this.isKeyboardActive = true;
            if (e.key === "ArrowLeft" || e.code === "KeyA") {
                this.left = true;
            }
            if (e.key === "ArrowRight" || e.code === "KeyD") {
                this.right = true;
            }
            if (e.key === " " || e.key === "ArrowUp" || e.code === "KeyW") {
                if (!this.jumpHeld) {
                    this.jumpJustPressed = true;
                }
                this.jumpHeld = true;
                e.preventDefault();
            }
            if (e.key === "ArrowDown" || e.code === "KeyS") {
                if (!this.sliding) {
                    this.slideJustPressed = true;
                }
                this.sliding = true;
                e.preventDefault();
            }
            if (e.key === "Shift" || e.code === "KeyE" || e.code === "KeyF" || e.code === "KeyN") {
                if (!this.turboHeld) {
                    this.turboJustPressed = true;
                }
                this.turboHeld = true;
            }
            if (e.code === "KeyJ" || e.code === "KeyX") {
                this.shootJustPressed = true;
            }
        });
        window.addEventListener("keyup", (e) => {
            if (e.key === "Escape")
                return;
            if (e.key === "ArrowLeft" || e.code === "KeyA") {
                this.left = false;
            }
            if (e.key === "ArrowRight" || e.code === "KeyD") {
                this.right = false;
            }
            if (e.key === "ArrowDown" || e.code === "KeyS") {
                this.sliding = false;
            }
            if (e.key === " " || e.key === "ArrowUp" || e.code === "KeyW") {
                this.jumpHeld = false;
            }
            if (e.key === "Shift" || e.code === "KeyE" || e.code === "KeyF" || e.code === "KeyN") {
                this.turboHeld = false;
            }
        });
    }
    setupPointerListeners() {
        const handlePointerDown = (e) => {
            this.isKeyboardActive = false;
            this.lastClick = { x: e.clientX, y: e.clientY };
            this.activePointers.set(e.pointerId, {
                x: e.clientX,
                y: e.clientY,
                startX: e.clientX,
                startY: e.clientY,
                startTime: performance.now()
            });
            this.evaluateTouchState();
        };
        const handlePointerMove = (e) => {
            const p = this.activePointers.get(e.pointerId);
            if (p) {
                p.x = e.clientX;
                p.y = e.clientY;
                this.evaluateTouchState();
            }
        };
        const handlePointerUp = (e) => {
            this.activePointers.delete(e.pointerId);
            this.evaluateTouchState();
        };
        window.addEventListener("pointerdown", handlePointerDown);
        window.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("pointerup", handlePointerUp);
        window.addEventListener("pointercancel", handlePointerUp);
    }
    setLaserAvailable(_available) {
        // Compatibilidad retroactiva
    }
    evaluateTouchState(customWidth, customHeight) {
        if (this.activePointers.size === 0) {
            this.left = false;
            this.right = false;
            this.jumpHeld = false;
            this.turboHeld = false;
            this.shootHeld = false;
            this.sliding = false;
            this.isSteering = false;
            this.steerValue = 0;
            return;
        }
        const width = customWidth ?? (typeof window !== "undefined" && window.innerWidth ? window.innerWidth : 360);
        const height = customHeight ?? (typeof window !== "undefined" && window.innerHeight ? window.innerHeight : 640);
        let wantsLeft = false;
        let wantsRight = false;
        let wantsJump = false;
        let wantsTurbo = false;
        let wantsShoot = false;
        let wantsSlide = false;
        let computedSteer = 0;
        let steeringActive = false;
        for (const [, p] of this.activePointers) {
            const deltaY = p.y - p.startY;
            const isSwipeDown = deltaY > 20;
            // 1. Franja Izquierda (< 50% del ancho): Control de Dirección y Deslizador
            if (p.x < width * 0.50) {
                steeringActive = true;
                // Posición normalizada en la mitad izquierda (-1.0 a +1.0)
                const normX = (p.x / (width * 0.50)) * 2 - 1;
                computedSteer = Math.max(-1, Math.min(1, normX));
                if (isSwipeDown) {
                    wantsSlide = true;
                    wantsRight = true; // El Slide Dash se proyecta siempre hacia adelante
                }
                else if (normX > 0.12) {
                    wantsRight = true;
                }
                else if (normX < -0.12) {
                    wantsLeft = true;
                }
            }
            // 2. Franja Derecha Completa (>= 50% del ancho): Botón TURBO / NITRO, Salto y Slide
            else {
                const isTurboZone = p.x >= width * 0.68 && p.y >= height * 0.70;
                if (isTurboZone) {
                    wantsTurbo = true;
                }
                else if (isSwipeDown) {
                    wantsSlide = true;
                    wantsRight = true; // El Slide Dash se proyecta siempre hacia adelante
                }
                else {
                    wantsJump = true;
                }
            }
        }
        this.isSteering = steeringActive;
        this.steerValue = computedSteer;
        this.left = wantsLeft;
        this.right = wantsRight;
        if (wantsSlide && !this.sliding) {
            this.slideJustPressed = true;
        }
        this.sliding = wantsSlide;
        if (wantsJump && !this.jumpHeld) {
            this.jumpJustPressed = true;
        }
        this.jumpHeld = wantsJump;
        if (wantsTurbo && !this.turboHeld) {
            this.turboJustPressed = true;
        }
        this.turboHeld = wantsTurbo;
        if (wantsShoot && !this.shootHeld) {
            this.shootJustPressed = true;
        }
        this.shootHeld = wantsShoot;
    }
    /**
     * Simula un toque físico en coordenadas de pantalla para verificación automatizada.
     */
    simulateTouch(x, y, screenWidth = 360, screenHeight = 640) {
        const dummyId = 999;
        this.lastClick = { x, y };
        this.activePointers.set(dummyId, {
            x,
            y,
            startX: x,
            startY: y,
            startTime: (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now()
        });
        this.evaluateTouchState(screenWidth, screenHeight);
    }
    /**
     * Libera los toques simulados.
     */
    simulateTouchRelease() {
        this.activePointers.clear();
        this.evaluateTouchState();
    }
    isMovingLeft() {
        return this.left;
    }
    isMovingRight() {
        return this.right;
    }
    isJumping() {
        return this.jumpHeld;
    }
    wasJumpJustPressed() {
        return this.jumpJustPressed;
    }
    isSliding() {
        return this.sliding;
    }
    wasSlideJustPressed() {
        return this.slideJustPressed;
    }
    isTurbo() {
        return this.turboHeld;
    }
    wasTurboJustPressed() {
        return this.turboJustPressed;
    }
    wasShootJustPressed() {
        return this.shootJustPressed;
    }
    triggerShoot() {
        this.shootJustPressed = true;
    }
    /**
     * Control algorítmico directo para Bots de Playtesting y Simulaciones Monte Carlo
     */
    setMockInputs(keys) {
        if (keys.right !== undefined)
            this.right = keys.right;
        if (keys.left !== undefined)
            this.left = keys.left;
        if (keys.jump !== undefined) {
            if (keys.jump && !this.jumpHeld) {
                this.jumpJustPressed = true;
            }
            this.jumpHeld = keys.jump;
        }
        if (keys.slide !== undefined) {
            if (keys.slide && !this.sliding) {
                this.slideJustPressed = true;
            }
            this.sliding = keys.slide;
        }
        if (keys.turbo !== undefined) {
            if (keys.turbo && !this.turboHeld) {
                this.turboJustPressed = true;
            }
            this.turboHeld = keys.turbo;
        }
    }
    /**
     * Resetea las señales instantáneas al final de cada frame de física.
     */
    endFrame() {
        this.jumpJustPressed = false;
        this.turboJustPressed = false;
        this.shootJustPressed = false;
        this.slideJustPressed = false;
        this.lastClick = null;
    }
}
