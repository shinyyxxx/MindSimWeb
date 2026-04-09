import { AbstractMind } from './AbstractMind';
import type { MindBaseOptions } from './AbstractMind';
import Mental from './Mental';
import * as THREE from 'three';
type PassthroughGlassBackup = {
    transmission: number;
    thickness: number;
    roughness: number;
    metalness: number;
    opacity: number;
    emissive: THREE.Color;
    emissiveIntensity: number;
    clearcoat: number;
    clearcoatRoughness: number;
    ior: number;
};
export class Mind extends AbstractMind {
    mentals: Mental[] = [];
    private explanationRunId = 0;
    private explanationPromise: Promise<void> | null = null;
    private explanationSuspendPhysics = false;
    private passthroughGlassActive = false;
    private passthroughGlassBackup: PassthroughGlassBackup | null = null;
    constructor(options: MindBaseOptions = {}) {
        super(options);
        this.createGeometry();
        this.createMaterial();
        this.createMesh();
    }
    createMaterial(): void {
        const baseOpacity = Math.min(this.opacity, 1);
        this.material = new THREE.MeshPhysicalMaterial({
            color: this.color,
            transmission: 1,
            thickness: 1.0,
            roughness: 0.2,
            metalness: 0,
            transparent: true,
            opacity: baseOpacity,
            ior: 2,
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
    setPassthroughFriendlyGlass(enabled: boolean): void {
        const mat = this.material;
        if (!(mat instanceof THREE.MeshPhysicalMaterial))
            return;
        if (enabled) {
            if (this.passthroughGlassActive)
                return;
            this.passthroughGlassBackup = {
                transmission: mat.transmission,
                thickness: mat.thickness,
                roughness: mat.roughness,
                metalness: mat.metalness,
                opacity: mat.opacity,
                emissive: mat.emissive.clone(),
                emissiveIntensity: mat.emissiveIntensity,
                clearcoat: mat.clearcoat,
                clearcoatRoughness: mat.clearcoatRoughness,
                ior: mat.ior,
            };
            mat.transmission = 0;
            mat.thickness = 0;
            mat.roughness = 0.42;
            mat.metalness = 0;
            mat.clearcoat = 0.45;
            mat.clearcoatRoughness = 0.28;
            mat.ior = 1.35;
            mat.opacity = Math.min(0.38, Math.max(mat.opacity, 0.22));
            mat.emissive.copy(mat.color).multiplyScalar(0.08);
            mat.emissiveIntensity = 0.35;
            mat.transparent = true;
            mat.depthWrite = false;
            mat.envMap = null;
            mat.envMapIntensity = 0;
            mat.needsUpdate = true;
            this.passthroughGlassActive = true;
            return;
        }
        if (!this.passthroughGlassActive || !this.passthroughGlassBackup)
            return;
        const b = this.passthroughGlassBackup;
        mat.transmission = b.transmission;
        mat.thickness = b.thickness;
        mat.roughness = b.roughness;
        mat.metalness = b.metalness;
        mat.opacity = b.opacity;
        mat.emissive.copy(b.emissive);
        mat.emissiveIntensity = b.emissiveIntensity;
        mat.clearcoat = b.clearcoat;
        mat.clearcoatRoughness = b.clearcoatRoughness;
        mat.ior = b.ior;
        mat.needsUpdate = true;
        this.passthroughGlassBackup = null;
        this.passthroughGlassActive = false;
    }
    getRadius(): number {
        return this.scale;
    }
    constrainMentalPosition(mental: Mental): void {
        if (mental.isOutsideMindPinned() || mental.isDragging())
            return;
        const mindRadius = this.getRadius();
        const mentalRadius = mental.getRadius() * this.scale;
        const maxDistance = Math.max(mentalRadius + 0.005, mindRadius - mentalRadius - 0.01);
        const position = mental.getPosition();
        const worldX = position.x * this.scale;
        const worldY = position.y * this.scale;
        const worldZ = position.z * this.scale;
        const distance = Math.sqrt(worldX * worldX + worldY * worldY + worldZ * worldZ);
        if (distance > maxDistance || distance === 0) {
            if (distance > 0) {
                const localDistance = Math.sqrt(position.x * position.x +
                    position.y * position.y +
                    position.z * position.z);
                const normalX = localDistance > 0 ? position.x / localDistance : 1;
                const normalY = localDistance > 0 ? position.y / localDistance : 0;
                const normalZ = localDistance > 0 ? position.z / localDistance : 0;
                const localMaxDistance = maxDistance / this.scale;
                mental.setPosition(normalX * localMaxDistance, normalY * localMaxDistance, normalZ * localMaxDistance);
            }
            else {
                const localMaxDistance = maxDistance / this.scale;
                const randomRadius = Math.random() * localMaxDistance * 0.3;
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(Math.random() * 2 - 1);
                const newX = randomRadius * Math.sin(phi) * Math.cos(theta);
                const newY = randomRadius * Math.sin(phi) * Math.sin(theta);
                const newZ = randomRadius * Math.cos(phi);
                mental.setPosition(newX, newY, newZ);
            }
        }
    }
    handleCollision(mental1: Mental, mental2: Mental): void {
        const pos1 = mental1.getPosition();
        const pos2 = mental2.getPosition();
        const vel1 = mental1.getVelocity();
        const vel2 = mental2.getVelocity();
        const radius1 = mental1.getRadius();
        const radius2 = mental2.getRadius();
        const dx = pos2.x - pos1.x;
        const dy = pos2.y - pos1.y;
        const dz = pos2.z - pos1.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const minDistance = radius1 + radius2;
        if (distance < minDistance && distance > 0) {
            const isFrozen1 = mental1.isFrozen();
            const isFrozen2 = mental2.isFrozen();
            const overlap = minDistance - distance;
            const normalX = dx / distance;
            const normalY = dy / distance;
            const normalZ = dz / distance;
            if (isFrozen1 && !isFrozen2) {
                const separationX = normalX * overlap;
                const separationY = normalY * overlap;
                const separationZ = normalZ * overlap;
                mental2.setPosition(pos2.x + separationX, pos2.y + separationY, pos2.z + separationZ);
                const mesh2 = mental2.getMesh();
                if (mesh2) {
                    mesh2.position.set(pos2.x + separationX, pos2.y + separationY, pos2.z + separationZ);
                }
                const dotProduct = vel2.x * normalX + vel2.y * normalY + vel2.z * normalZ;
                if (dotProduct < 0) {
                    const bounceStrength = 0.9;
                    const impulse = dotProduct * (1 + bounceStrength);
                    const newVel2X = vel2.x - impulse * normalX;
                    const newVel2Y = vel2.y - impulse * normalY;
                    const newVel2Z = vel2.z - impulse * normalZ;
                    mental2.setVelocity(newVel2X, newVel2Y, newVel2Z);
                    mental2.normalizeVelocityToMotionSpeed();
                }
            }
            else if (isFrozen2 && !isFrozen1) {
                const separationX = -normalX * overlap;
                const separationY = -normalY * overlap;
                const separationZ = -normalZ * overlap;
                mental1.setPosition(pos1.x + separationX, pos1.y + separationY, pos1.z + separationZ);
                const mesh1 = mental1.getMesh();
                if (mesh1) {
                    mesh1.position.set(pos1.x + separationX, pos1.y + separationY, pos1.z + separationZ);
                }
                const dotProduct = vel1.x * normalX + vel1.y * normalY + vel1.z * normalZ;
                if (dotProduct > 0) {
                    const bounceStrength = 0.9;
                    const impulse = dotProduct * (1 + bounceStrength);
                    const newVel1X = vel1.x - impulse * normalX;
                    const newVel1Y = vel1.y - impulse * normalY;
                    const newVel1Z = vel1.z - impulse * normalZ;
                    mental1.setVelocity(newVel1X, newVel1Y, newVel1Z);
                    mental1.normalizeVelocityToMotionSpeed();
                }
            }
            else {
                const separationX = normalX * overlap * 0.5;
                const separationY = normalY * overlap * 0.5;
                const separationZ = normalZ * overlap * 0.5;
                mental1.setPosition(pos1.x - separationX, pos1.y - separationY, pos1.z - separationZ);
                mental2.setPosition(pos2.x + separationX, pos2.y + separationY, pos2.z + separationZ);
                const mesh1 = mental1.getMesh();
                const mesh2 = mental2.getMesh();
                if (mesh1) {
                    mesh1.position.set(pos1.x - separationX, pos1.y - separationY, pos1.z - separationZ);
                }
                if (mesh2) {
                    mesh2.position.set(pos2.x + separationX, pos2.y + separationY, pos2.z + separationZ);
                }
                const relVelX = vel2.x - vel1.x;
                const relVelY = vel2.y - vel1.y;
                const relVelZ = vel2.z - vel1.z;
                const dotProduct = relVelX * normalX + relVelY * normalY + relVelZ * normalZ;
                if (dotProduct < 0) {
                    const bounceStrength = 0.9;
                    const impulse = dotProduct * (1 + bounceStrength);
                    const newVel1X = vel1.x + impulse * normalX;
                    const newVel1Y = vel1.y + impulse * normalY;
                    const newVel1Z = vel1.z + impulse * normalZ;
                    const newVel2X = vel2.x - impulse * normalX;
                    const newVel2Y = vel2.y - impulse * normalY;
                    const newVel2Z = vel2.z - impulse * normalZ;
                    mental1.setVelocity(newVel1X, newVel1Y, newVel1Z);
                    mental2.setVelocity(newVel2X, newVel2Y, newVel2Z);
                    mental1.normalizeVelocityToMotionSpeed();
                    mental2.normalizeVelocityToMotionSpeed();
                }
            }
        }
    }
    handleBoundaryCollision(mental: Mental): void {
        if (mental.isOutsideMindPinned() || mental.isDragging())
            return;
        const mindRadius = this.getRadius();
        const mentalRadius = mental.getRadius() * this.scale;
        const maxDistance = mindRadius - mentalRadius - 0.01;
        const position = mental.getPosition();
        const worldX = position.x * this.scale;
        const worldY = position.y * this.scale;
        const worldZ = position.z * this.scale;
        const distance = Math.sqrt(worldX * worldX + worldY * worldY + worldZ * worldZ);
        if (distance >= maxDistance) {
            const localDistance = Math.sqrt(position.x * position.x +
                position.y * position.y +
                position.z * position.z);
            const normalX = localDistance > 0 ? position.x / localDistance : 1;
            const normalY = localDistance > 0 ? position.y / localDistance : 0;
            const normalZ = localDistance > 0 ? position.z / localDistance : 0;
            const localMaxDistance = maxDistance / this.scale;
            mental.setPosition(normalX * localMaxDistance, normalY * localMaxDistance, normalZ * localMaxDistance);
            const velocity = mental.getVelocity();
            const dotProduct = velocity.x * normalX + velocity.y * normalY + velocity.z * normalZ;
            const bounceStrength = 0.95;
            if (dotProduct > 0) {
                const newVelX = velocity.x - (1 + bounceStrength) * dotProduct * normalX;
                const newVelY = velocity.y - (1 + bounceStrength) * dotProduct * normalY;
                const newVelZ = velocity.z - (1 + bounceStrength) * dotProduct * normalZ;
                mental.setVelocity(newVelX, newVelY, newVelZ);
            }
            else {
                const tangentialVelX = velocity.x - dotProduct * normalX;
                const tangentialVelY = velocity.y - dotProduct * normalY;
                const tangentialVelZ = velocity.z - dotProduct * normalZ;
                mental.setVelocity(tangentialVelX, tangentialVelY, tangentialVelZ);
            }
            mental.normalizeVelocityToMotionSpeed();
        }
    }
    updatePhysics(deltaTime: number = 0.016): void {
        if (this.material) {
            this.material.envMap = null;
        }
        if (this.explanationSuspendPhysics)
            return;
        const mindRadius = this.getRadius();
        const speedMultiplier = deltaTime * 60;
        const mindMesh = this.getMesh();
        if (!mindMesh)
            return;
        this.mentals.forEach((mental) => {
            mental.updateVisualEffects(deltaTime);
            if (mental.isOutsideMindPinned() || mental.isDragging()) {
                mental.setVelocity(0, 0, 0);
                return;
            }
            if (mental.isFrozen()) {
                mental.setVelocity(0, 0, 0);
                return;
            }
            mental.normalizeVelocityToMotionSpeed();
            const position = mental.getPosition();
            const velocity = mental.getVelocity();
            const mentalRadius = mental.getRadius() * this.scale;
            const maxDistance = mindRadius - mentalRadius - 0.01;
            let nextX = position.x + velocity.x * speedMultiplier;
            const nextY = position.y + velocity.y * speedMultiplier;
            const nextZ = position.z + velocity.z * speedMultiplier;
            const nextWorldX = nextX * this.scale;
            const nextWorldY = nextY * this.scale;
            const nextWorldZ = nextZ * this.scale;
            const nextDistance = Math.sqrt(nextWorldX * nextWorldX + nextWorldY * nextWorldY + nextWorldZ * nextWorldZ);
            if (nextDistance > maxDistance) {
                const nextLocalDistance = Math.sqrt(nextX * nextX + nextY * nextY + nextZ * nextZ);
                const normalX = nextLocalDistance > 0 ? nextX / nextLocalDistance : 1;
                const normalY = nextLocalDistance > 0 ? nextY / nextLocalDistance : 0;
                const normalZ = nextLocalDistance > 0 ? nextZ / nextLocalDistance : 0;
                const dotProduct = velocity.x * normalX + velocity.y * normalY + velocity.z * normalZ;
                const bounceStrength = 0.95;
                if (dotProduct > 0) {
                    const newVelX = velocity.x - (1 + bounceStrength) * dotProduct * normalX;
                    const newVelY = velocity.y - (1 + bounceStrength) * dotProduct * normalY;
                    const newVelZ = velocity.z - (1 + bounceStrength) * dotProduct * normalZ;
                    mental.setVelocity(newVelX, newVelY, newVelZ);
                }
                mental.normalizeVelocityToMotionSpeed();
                const localMaxDistance = maxDistance / this.scale;
                mental.setPosition(normalX * localMaxDistance, normalY * localMaxDistance, normalZ * localMaxDistance);
            }
            else {
                mental.setPosition(nextX, nextY, nextZ);
            }
        });
        for (let i = 0; i < this.mentals.length; i++) {
            for (let j = i + 1; j < this.mentals.length; j++) {
                const a = this.mentals[i];
                const b = this.mentals[j];
                if (a.isOutsideMindPinned() || b.isOutsideMindPinned() || a.isDragging() || b.isDragging())
                    continue;
                if (a.isFrozen() && b.isFrozen())
                    continue;
                this.handleCollision(a, b);
            }
        }
        this.mentals.forEach(mental => {
            if (mental.isOutsideMindPinned() || mental.isDragging())
                return;
            this.constrainMentalPosition(mental);
            mental.normalizeVelocityToMotionSpeed();
        });
    }
    addMental(mental: Mental): void {
        if (!this.mentals.includes(mental)) {
            this.mentals.push(mental);
            this.constrainMentalPosition(mental);
            const mentalMesh = mental.getMesh();
            const mindMesh = this.getMesh();
            if (mentalMesh && mindMesh) {
                mindMesh.add(mentalMesh);
            }
        }
    }
    removeMental(mental: Mental): void {
        const index = this.mentals.indexOf(mental);
        if (index !== -1) {
            this.mentals.splice(index, 1);
            const mentalMesh = mental.getMesh();
            const mindMesh = this.getMesh();
            if (mentalMesh && mindMesh) {
                mindMesh.remove(mentalMesh);
            }
        }
    }
    getMentals(): Mental[] {
        return [...this.mentals];
    }
    getMental(index: number): Mental | undefined {
        return this.mentals[index];
    }
    getMentalByName(name: string): Mental | undefined {
        return this.mentals.find(mental => mental.getName() === name);
    }
    clearMentals(): void {
        this.mentals.forEach(mental => {
            const mentalMesh = mental.getMesh();
            const mindMesh = this.getMesh();
            if (mentalMesh && mindMesh) {
                mindMesh.remove(mentalMesh);
            }
            mental.dispose();
        });
        this.mentals = [];
    }
    getMentalCount(): number {
        return this.mentals.length;
    }
    private waitMs(ms: number, runId: number): Promise<void> {
        if (ms <= 0)
            return Promise.resolve();
        return new Promise((resolve) => {
            const startedAt = typeof performance !== 'undefined' ? performance.now() : Date.now();
            const step = (now: number) => {
                if (runId !== this.explanationRunId) {
                    resolve();
                    return;
                }
                if (now - startedAt >= ms) {
                    resolve();
                    return;
                }
                requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
        });
    }
    private animateMentalTo(mental: Mental, from: THREE.Vector3, to: THREE.Vector3, durationMs: number, runId: number): Promise<void> {
        if (durationMs <= 0) {
            mental.setPosition(to.x, to.y, to.z);
            return Promise.resolve();
        }
        return new Promise((resolve) => {
            const startedAt = typeof performance !== 'undefined' ? performance.now() : Date.now();
            const step = (now: number) => {
                if (runId !== this.explanationRunId) {
                    resolve();
                    return;
                }
                const rawT = Math.min(1, (now - startedAt) / durationMs);
                const easedT = 1 - Math.pow(1 - rawT, 3);
                const nextX = THREE.MathUtils.lerp(from.x, to.x, easedT);
                const nextY = THREE.MathUtils.lerp(from.y, to.y, easedT);
                const nextZ = THREE.MathUtils.lerp(from.z, to.z, easedT);
                mental.setPosition(nextX, nextY, nextZ);
                if (rawT >= 1) {
                    resolve();
                    return;
                }
                requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
        });
    }
    stopMentalExplanationAnimation(): void {
        this.explanationRunId += 1;
        this.explanationSuspendPhysics = false;
        this.explanationPromise = null;
    }
    async explainMindMentalsAnimation(options?: {
        outDurationMs?: number;
        holdDurationMs?: number;
        returnDurationMs?: number;
        outDistanceWorld?: number;
        presentationDirectionLocal?: THREE.Vector3 | {
            x: number;
            y: number;
            z: number;
        };
        presentationSpread?: number;
        onStart?: () => void | Promise<void>;
        onMentalFocus?: (payload: {
            mental: Mental;
            index: number;
            total: number;
        }) => void | Promise<void>;
        onComplete?: () => void | Promise<void>;
    }): Promise<void> {
        this.stopMentalExplanationAnimation();
        const runId = this.explanationRunId;
        const outDurationMs = options?.outDurationMs ?? 650;
        const holdDurationMs = options?.holdDurationMs ?? 420;
        const returnDurationMs = options?.returnDurationMs ?? 560;
        const outDistanceWorld = options?.outDistanceWorld ?? 0.45;
        const presentationSpread = options?.presentationSpread ?? 0.08;
        const mentals = this.getMentals();
        if (!mentals.length)
            return;
        const customDirection = options?.presentationDirectionLocal
            ? new THREE.Vector3(options.presentationDirectionLocal.x, options.presentationDirectionLocal.y, options.presentationDirectionLocal.z)
            : null;
        if (customDirection && customDirection.lengthSq() < 1e-8)
            customDirection.set(-1, 0.18, 0.24);
        customDirection?.normalize();
        const spreadSide = new THREE.Vector3();
        const spreadLift = new THREE.Vector3();
        if (customDirection) {
            const refUp = Math.abs(customDirection.y) > 0.95 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
            spreadSide.crossVectors(customDirection, refUp).normalize();
            spreadLift.crossVectors(spreadSide, customDirection).normalize();
        }
        const snapshots = mentals.map((mental, index) => {
            const p = mental.getPosition();
            const v = mental.getVelocity();
            const dir = new THREE.Vector3();
            if (customDirection) {
                const centered = mentals.length > 1 ? (index / (mentals.length - 1)) - 0.5 : 0;
                const fan = centered * presentationSpread;
                const bob = Math.sin(index * 1.7) * presentationSpread * 0.3;
                dir
                    .copy(customDirection)
                    .addScaledVector(spreadSide, fan)
                    .addScaledVector(spreadLift, bob);
            }
            else {
                dir.set(p.x, p.y, p.z);
                if (dir.lengthSq() < 1e-8) {
                    const angle = (index / Math.max(1, mentals.length)) * Math.PI * 2;
                    dir.set(Math.cos(angle), 0.2, Math.sin(angle));
                }
            }
            dir.normalize();
            return {
                mental,
                start: new THREE.Vector3(p.x, p.y, p.z),
                velocity: v,
                wasFrozen: mental.isFrozen(),
                outwardDir: dir,
            };
        });
        this.explanationSuspendPhysics = true;
        snapshots.forEach(({ mental }) => {
            mental.setFrozen(true);
            mental.setVelocity(0, 0, 0);
        });
        this.explanationPromise = (async () => {
            try {
                await options?.onStart?.();
                if (runId !== this.explanationRunId)
                    return;
                const outDistanceLocal = outDistanceWorld / Math.max(0.00001, this.scale);
                for (let i = 0; i < snapshots.length; i += 1) {
                    const snapshot = snapshots[i];
                    if (runId !== this.explanationRunId)
                        return;
                    const bubbleRadiusLocal = snapshot.mental.getRadius();
                    const targetRadiusLocal = 1 + bubbleRadiusLocal + outDistanceLocal;
                    const target = snapshot.outwardDir.clone().multiplyScalar(targetRadiusLocal);
                    await this.animateMentalTo(snapshot.mental, snapshot.start, target, outDurationMs, runId);
                    if (runId !== this.explanationRunId)
                        return;
                    await options?.onMentalFocus?.({ mental: snapshot.mental, index: i, total: snapshots.length });
                    if (runId !== this.explanationRunId)
                        return;
                    await this.waitMs(holdDurationMs, runId);
                    await this.animateMentalTo(snapshot.mental, target, snapshot.start, returnDurationMs, runId);
                    await this.waitMs(120, runId);
                }
                await options?.onComplete?.();
            }
            finally {
                snapshots.forEach(({ mental, start, velocity, wasFrozen }) => {
                    mental.setPosition(start.x, start.y, start.z);
                    mental.setVelocity(velocity.x, velocity.y, velocity.z);
                    mental.setFrozen(wasFrozen);
                });
                if (runId === this.explanationRunId) {
                    this.explanationSuspendPhysics = false;
                    this.explanationPromise = null;
                }
            }
        })();
        await this.explanationPromise;
    }
    dispose(): void {
        this.stopMentalExplanationAnimation();
        this.clearMentals();
        super.dispose();
    }
}
export default Mind;
