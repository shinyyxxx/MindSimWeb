import * as THREE from 'three';
function wrapLabelLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const words = text.trim().split(/\s+/).filter(Boolean);
    if (!words.length)
        return [''];
    const lines: string[] = [];
    let current = '';
    for (const word of words) {
        const trial = current ? `${current} ${word}` : word;
        if (ctx.measureText(trial).width <= maxWidth) {
            current = trial;
            continue;
        }
        if (current) {
            lines.push(current);
            current = '';
        }
        if (ctx.measureText(word).width <= maxWidth) {
            current = word;
            continue;
        }
        let chunk = '';
        for (const ch of word) {
            const next = chunk + ch;
            if (ctx.measureText(next).width <= maxWidth) {
                chunk = next;
            }
            else {
                if (chunk)
                    lines.push(chunk);
                chunk = ch;
            }
        }
        if (chunk)
            current = chunk;
    }
    if (current)
        lines.push(current);
    return lines.length ? lines : [''];
}
export interface MindBaseOptions {
    name?: string;
    detail?: string;
    color?: number | string;
    scale?: number;
    labelEnabled?: boolean;
    labelWorldSize?: number;
    labelOffset?: number;
    metalness?: number;
    roughness?: number;
    transparent?: boolean;
    opacity?: number;
    widthSegments?: number;
    heightSegments?: number;
    position?: {
        x?: number;
        y?: number;
        z?: number;
    } | [
        number,
        number,
        number
    ];
    state?: string;
}
export class AbstractMind {
    name: string;
    detail: string;
    color: number;
    scale: number;
    metalness: number;
    roughness: number;
    transparent: boolean;
    opacity: number;
    widthSegments: number;
    heightSegments: number;
    position: {
        x: number;
        y: number;
        z: number;
    };
    geometry: THREE.SphereGeometry | null;
    material: THREE.MeshStandardMaterial | null;
    mesh: THREE.Mesh | null;
    labelEnabled: boolean;
    labelWorldSize: number;
    labelOffset: number;
    private labelDepthOcclusion: boolean;
    private labelSprite: THREE.Sprite | null;
    constructor(options: MindBaseOptions = {}) {
        this.name = options.name || '';
        this.detail = options.detail || '';
        const colorValue = options.color || 0xffffff;
        this.color = typeof colorValue === 'string'
            ? parseInt(colorValue.replace('#', ''), 16)
            : colorValue;
        this.scale = options.scale || 1;
        this.metalness = options.metalness || 0.1;
        this.roughness = options.roughness || 0.4;
        this.transparent = !!options.transparent;
        this.opacity = (options.opacity != null) ? options.opacity : 1;
        this.widthSegments = options.widthSegments || 64;
        this.heightSegments = options.heightSegments || 64;
        if (Array.isArray(options.position)) {
            this.position = {
                x: options.position[0] || 0,
                y: options.position[1] || 0,
                z: options.position[2] || 0
            };
        }
        else if (options.position) {
            this.position = {
                x: options.position.x || 0,
                y: options.position.y || 0,
                z: options.position.z || 0
            };
        }
        else {
            this.position = { x: 0, y: 0, z: 0 };
        }
        this.geometry = null;
        this.material = null;
        this.mesh = null;
        this.labelEnabled = options.labelEnabled ?? true;
        this.labelWorldSize = options.labelWorldSize ?? 0.35;
        this.labelOffset = options.labelOffset ?? 0.15;
        this.labelDepthOcclusion = false;
        this.labelSprite = null;
    }
    createGeometry(): void {
        this.geometry = new THREE.SphereGeometry(1, this.widthSegments, this.heightSegments);
    }
    createMaterial(): void {
        this.material = new THREE.MeshStandardMaterial({
            color: this.color,
            metalness: this.metalness,
            roughness: this.roughness,
            transparent: this.transparent,
            opacity: this.opacity,
            depthWrite: this.transparent ? false : true,
            side: THREE.FrontSide
        });
    }
    createMesh(): void {
        if (!this.geometry || !this.material) {
            throw new Error('Geometry and material must be created before creating mesh');
        }
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.set(this.position.x, this.position.y, this.position.z);
        this.mesh.scale.set(this.scale, this.scale, this.scale);
        this.updateLabel();
    }
    setColor(color: number | string): void {
        this.color = typeof color === 'string'
            ? parseInt(color.replace('#', ''), 16)
            : color;
        if (this.material) {
            this.material.color.setHex(this.color);
        }
    }
    setScale(scale: number): void {
        this.scale = scale;
        if (this.mesh) {
            this.mesh.scale.set(scale, scale, scale);
        }
        this.updateLabelTransform();
    }
    setLabelWorldSize(size: number): void {
        this.labelWorldSize = Math.max(0.01, size);
        this.updateLabelTransform();
    }
    setLabelOffset(offset: number): void {
        this.labelOffset = offset;
        this.updateLabelTransform();
    }
    setOpacity(opacity: number): void {
        const clamped = Math.max(0, Math.min(1, opacity));
        this.opacity = clamped;
        this.transparent = clamped < 1;
        if (this.material) {
            this.material.opacity = clamped;
            this.material.transparent = this.transparent;
            this.material.depthWrite = !this.transparent;
            this.material.needsUpdate = true;
        }
    }
    setMetalness(value: number): void {
        this.metalness = value;
        if (this.material) {
            this.material.metalness = value;
        }
    }
    setRoughness(value: number): void {
        this.roughness = value;
        if (this.material) {
            this.material.roughness = value;
        }
    }
    setPosition(x: number | {
        x?: number;
        y?: number;
        z?: number;
    } | [
        number,
        number,
        number
    ], y?: number, z?: number): void {
        if (Array.isArray(x)) {
            this.position = { x: x[0] || 0, y: x[1] || 0, z: x[2] || 0 };
        }
        else if (typeof x === 'object' && x !== null) {
            this.position = {
                x: x.x ?? this.position.x,
                y: x.y ?? this.position.y,
                z: x.z ?? this.position.z
            };
        }
        else {
            this.position = {
                x: x,
                y: y ?? this.position.y,
                z: z ?? this.position.z
            };
        }
        if (this.mesh) {
            this.mesh.position.set(this.position.x, this.position.y, this.position.z);
        }
    }
    getPosition(): {
        x: number;
        y: number;
        z: number;
    } {
        return { ...this.position };
    }
    setName(name: string): void {
        this.name = name;
        this.updateLabel();
    }
    setLabelEnabled(enabled: boolean): void {
        this.labelEnabled = enabled;
        this.updateLabel();
    }
    setLabelDepthOcclusion(enabled: boolean): void {
        this.labelDepthOcclusion = enabled;
        if (!this.labelSprite)
            return;
        const material = this.labelSprite.material;
        if (material instanceof THREE.SpriteMaterial) {
            material.depthTest = enabled;
            material.depthWrite = false;
            material.needsUpdate = true;
        }
        this.labelSprite.renderOrder = enabled ? 0 : 999;
    }
    getName(): string {
        return this.name;
    }
    setDetail(detail: string): void {
        this.detail = detail;
    }
    getDetail(): string {
        return this.detail;
    }
    getMesh(): THREE.Mesh | null {
        return this.mesh;
    }
    private createLabelTexture(text: string): THREE.CanvasTexture {
        const safe = (text || '').trim() || '—';
        const pad = 20;
        const minCanvasW = 260;
        const maxCanvasW = 1536;
        const baseH = 256;
        const maxCanvasH = 720;
        const minFont = 22;
        const maxFont = 84;
        const horizontalMargin = pad * 2 + 48;
        const innerMaxW = maxCanvasW - horizontalMargin;
        const measure = document.createElement('canvas').getContext('2d');
        if (!measure) {
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = baseH;
            const t = new THREE.CanvasTexture(canvas);
            t.needsUpdate = true;
            return t;
        }
        let fontSize = maxFont;
        let lines: string[] = [safe];
        let canvasW = minCanvasW;
        let canvasH = baseH;
        while (fontSize >= minFont) {
            measure.font = `700 ${fontSize}px Arial`;
            const tw = measure.measureText(safe).width;
            if (tw <= innerMaxW) {
                canvasW = Math.ceil(Math.min(maxCanvasW, Math.max(minCanvasW, tw + horizontalMargin)));
                canvasH = baseH;
                lines = [safe];
                break;
            }
            fontSize -= 3;
        }
        if (fontSize < minFont) {
            fontSize = minFont;
            measure.font = `700 ${fontSize}px Arial`;
            lines = wrapLabelLines(measure, safe, innerMaxW);
            const maxLineW = Math.max(...lines.map((ln) => measure.measureText(ln).width), 0);
            canvasW = Math.ceil(Math.min(maxCanvasW, Math.max(minCanvasW, maxLineW + horizontalMargin)));
            const lineHeight = fontSize * 1.22;
            canvasH = Math.ceil(Math.min(maxCanvasH, Math.max(baseH, pad * 2 + lines.length * lineHeight + 28)));
        }
        const canvas = document.createElement('canvas');
        canvas.width = canvasW;
        canvas.height = canvasH;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            const t = new THREE.CanvasTexture(canvas);
            t.needsUpdate = true;
            return t;
        }
        ctx.clearRect(0, 0, canvasW, canvasH);
        const boxW = canvasW - pad * 2;
        const boxH = canvasH - pad * 2;
        const r = Math.min(22, boxW * 0.08, boxH * 0.08);
        const x = pad;
        const y = pad;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + boxW, y, x + boxW, y + boxH, r);
        ctx.arcTo(x + boxW, y + boxH, x, y + boxH, r);
        ctx.arcTo(x, y + boxH, x, y, r);
        ctx.arcTo(x, y, x + boxW, y, r);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.98)';
        ctx.font = `700 ${fontSize}px Arial`;
        const lh = fontSize * 1.22;
        const blockH = lines.length * lh;
        let cy = canvasH / 2 - blockH / 2 + lh / 2;
        for (const line of lines) {
            ctx.fillText(line, canvasW / 2, cy);
            cy += lh;
        }
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        return texture;
    }
    private removeLabel(): void {
        if (!this.mesh || !this.labelSprite)
            return;
        this.mesh.remove(this.labelSprite);
        const material = this.labelSprite.material;
        if (material instanceof THREE.SpriteMaterial) {
            material.map?.dispose();
            material.dispose();
        }
        this.labelSprite = null;
    }
    private updateLabelTransform(): void {
        if (!this.mesh || !this.labelSprite)
            return;
        const yLocal = 1 + (this.labelOffset / Math.max(0.00001, this.scale));
        this.labelSprite.position.set(0, yLocal, 0);
        const s = this.labelWorldSize / Math.max(0.00001, this.scale);
        const mat = this.labelSprite.material;
        const map = mat instanceof THREE.SpriteMaterial ? mat.map : null;
        const img = map?.image as {
            width?: number;
            height?: number;
        } | undefined;
        const tw = img?.width && img.width > 0 ? img.width : 512;
        const th = img?.height && img.height > 0 ? img.height : 256;
        const aspect = tw / th;
        this.labelSprite.scale.set(s * aspect, s, 1);
    }
    private updateLabel(): void {
        if (!this.mesh)
            return;
        const shouldShow = this.labelEnabled && this.name.trim().length > 0;
        if (!shouldShow) {
            this.removeLabel();
            return;
        }
        if (!this.labelSprite) {
            const texture = this.createLabelTexture(this.name);
            const material = new THREE.SpriteMaterial({
                map: texture,
                transparent: true,
                depthTest: this.labelDepthOcclusion,
                depthWrite: false
            });
            this.labelSprite = new THREE.Sprite(material);
            this.labelSprite.renderOrder = this.labelDepthOcclusion ? 0 : 999;
            this.mesh.add(this.labelSprite);
        }
        else {
            const material = this.labelSprite.material;
            if (material instanceof THREE.SpriteMaterial) {
                material.map?.dispose();
                material.map = this.createLabelTexture(this.name);
                material.needsUpdate = true;
            }
        }
        this.updateLabelTransform();
    }
    dispose(): void {
        this.removeLabel();
        if (this.geometry) {
            this.geometry.dispose();
        }
        if (this.material) {
            this.material.dispose();
        }
    }
}
export default AbstractMind;
