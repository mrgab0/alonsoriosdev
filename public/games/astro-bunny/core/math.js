export class Vec2 {
    static create(x = 0, y = 0) {
        return { x, y };
    }
    static add(a, b) {
        return { x: a.x + b.x, y: a.y + b.y };
    }
    static sub(a, b) {
        return { x: a.x - b.x, y: a.y - b.y };
    }
    static scale(v, scalar) {
        return { x: v.x * scalar, y: v.y * scalar };
    }
    static lengthSq(v) {
        return v.x * v.x + v.y * v.y;
    }
    static length(v) {
        return Math.sqrt(v.x * v.x + v.y * v.y);
    }
    static normalize(v) {
        const len = Vec2.length(v);
        if (len === 0)
            return { x: 0, y: 0 };
        return { x: v.x / len, y: v.y / len };
    }
    static distance(a, b) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    static dot(a, b) {
        return a.x * b.x + a.y * b.y;
    }
    static lerp(a, b, t) {
        return {
            x: a.x + (b.x - a.x) * t,
            y: a.y + (b.y - a.y) * t
        };
    }
}
export class PolarMath {
    /**
     * Convierte coordenadas polares relativas (radio, ángulo) a coordenadas cartesianas (x, y).
     */
    static polarToCartesian(centerX, centerY, radius, angle) {
        return {
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius
        };
    }
    /**
     * Convierte una posición cartesiana a coordenadas polares respecto a un centro.
     */
    static cartesianToPolar(centerX, centerY, x, y) {
        const dx = x - centerX;
        const dy = y - centerY;
        const radius = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        return { radius, angle };
    }
    /**
     * Vector unitario normal radial hacia el exterior del planeta en un ángulo dado.
     */
    static radialNormal(angle) {
        return {
            x: Math.cos(angle),
            y: Math.sin(angle)
        };
    }
    /**
     * Vector unitario tangente a la superficie del planeta en un ángulo dado.
     * @param clockwise Si es true, apunta en sentido horario.
     */
    static surfaceTangent(angle, clockwise = true) {
        if (clockwise) {
            return {
                x: -Math.sin(angle),
                y: Math.cos(angle)
            };
        }
        return {
            x: Math.sin(angle),
            y: -Math.cos(angle)
        };
    }
    /**
     * Normaliza cualquier ángulo al rango estándar [-PI, PI].
     */
    static normalizeAngle(angle) {
        let a = angle % (Math.PI * 2);
        if (a > Math.PI)
            a -= Math.PI * 2;
        else if (a < -Math.PI)
            a += Math.PI * 2;
        return a;
    }
    /**
     * Calcula la diferencia angular más corta entre dos ángulos (en radianes).
     */
    static deltaAngle(from, to) {
        return PolarMath.normalizeAngle(to - from);
    }
    /**
     * Interpolación lineal entre dos valores escalares.
     */
    static lerp(a, b, t) {
        return a + (b - a) * t;
    }
    /**
     * Restringe un valor dentro de un rango mínimo y máximo.
     */
    static clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }
}
