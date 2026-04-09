import { AbstractMind } from './AbstractMind';
import type { MindBaseOptions } from './AbstractMind';
import * as THREE from 'three';
export class MaterialForm extends AbstractMind {
    constructor(options: MindBaseOptions = {}) {
        super({
            name: options.name ?? 'Material Form',
            detail: options.detail ?? 'Material form / physical phenomena',
            color: options.color ?? '#f59e0b',
            opacity: options.opacity ?? 0.18,
            transparent: options.transparent ?? true,
            labelEnabled: options.labelEnabled ?? true,
            ...options,
        });
        this.createGeometry();
        this.createMaterial();
        this.createMesh();
    }
    createMaterial(): void {
        const baseOpacity = Math.min(this.opacity, 1);
        this.material = new THREE.MeshPhysicalMaterial({
            color: this.color,
            transmission: 1,
            thickness: 0.9,
            roughness: 0.35,
            metalness: 0,
            transparent: true,
            opacity: baseOpacity,
            ior: 1.6,
            side: THREE.DoubleSide,
            depthWrite: false,
            envMapIntensity: 0,
        });
        this.material.envMap = null;
    }
    createMesh(): void {
        super.createMesh();
        if (this.mesh) {
            this.mesh.castShadow = true;
            this.mesh.receiveShadow = true;
        }
    }
    getRadius(): number {
        return this.scale;
    }
}
export default MaterialForm;
