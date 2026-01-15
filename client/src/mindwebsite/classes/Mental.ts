import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js'
import { AbstractMental } from './AbstractMental'
import type { MentalBaseOptions } from './AbstractMental'

/**
 * Mental class extends AbstractMental
 * Provides a concrete implementation for Mental sphere objects inside the Mind
 * with optional glTF model attachment.
 */
export class Mental extends AbstractMental {
  modelPath?: string
  modelTargetWorldSize: number
  modelOffset: { x: number; y: number; z: number }
  private attachedModel: THREE.Object3D | null
  private frozen: boolean

  constructor(options: MentalBaseOptions = {}) {
    // Default: no floating labels for mentals unless explicitly enabled
    const labelEnabled = options.labelEnabled ?? false
    super({ ...options, labelEnabled })
    this.createGeometry()
    this.createMaterial()
    this.createMesh()
    
    this.modelPath = options.modelPath
    this.modelTargetWorldSize = options.modelTargetWorldSize ?? 0.16
    this.modelOffset = {
      x: options.modelOffset?.x ?? 0,
      y: options.modelOffset?.y ?? 0,
      z: options.modelOffset?.z ?? 0
    }
    this.attachedModel = null
    this.frozen = false

    // Initialize a slow, constant, non-stop drift inside the Mind sphere
    this.normalizeVelocityToMotionSpeed()
  }

  createMaterial(): void {
    const baseOpacity = Math.min(this.opacity, 0.45)
    const bubbleMaterial = new THREE.MeshPhysicalMaterial({
      color: this.color,
      transmission: 1.0,
      thickness: 0.35,
      roughness: 0,
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0,
      iridescence: 0.2,
      iridescenceIOR: 1.05,
      iridescenceThicknessRange: [0, 1200],
      envMapIntensity: 0.1,
      transparent: true,
      opacity: baseOpacity,
      ior: 1.2,
      attenuationColor: '#ffffff',
      attenuationDistance: 1.2,
      depthWrite: false,
      side: THREE.DoubleSide
    })

    this.material = bubbleMaterial
  }

  setModelPath(path?: string): void {
    this.modelPath = path
  }

  setModelTargetWorldSize(size: number): void {
    this.modelTargetWorldSize = Math.max(0, size)
  }

  setModelOffset(offset: { x?: number; y?: number; z?: number }): void {
    this.modelOffset = {
      x: offset.x ?? this.modelOffset.x,
      y: offset.y ?? this.modelOffset.y,
      z: offset.z ?? this.modelOffset.z
    }
  }

  async loadModel(
    renderer: THREE.WebGLRenderer,
    options: {
      basisPath?: string
      targetWorldSize?: number
      offset?: { x?: number; y?: number; z?: number }
    } = {}
  ): Promise<void> {
    if (!this.modelPath || !this.mesh) return

    // Remove any existing model first
    this.detachModel()

    const loader = new GLTFLoader().setCrossOrigin('anonymous')
    const basisPath = options.basisPath
      ?? 'https://unpkg.com/three@0.160.0/examples/jsm/libs/basis/'
    const ktx2Loader = new KTX2Loader()
      .setTranscoderPath(basisPath)
      .detectSupport(renderer)
    loader.setKTX2Loader(ktx2Loader)

    const targetWorldSize = options.targetWorldSize ?? this.modelTargetWorldSize
    const offset = {
      x: options.offset?.x ?? this.modelOffset.x,
      y: options.offset?.y ?? this.modelOffset.y,
      z: options.offset?.z ?? this.modelOffset.z
    }

    return new Promise((resolve, reject) => {
      loader.load(
        this.modelPath!,
        (gltf) => {
          const obj = gltf.scene
          // Scale relative to bubble size so it fits inside.
          const bubbleScale = this.mesh?.scale.x || 1
          const neededLocalScale = targetWorldSize / Math.max(0.00001, bubbleScale)
          obj.scale.setScalar(neededLocalScale)
          obj.position.set(offset.x, offset.y, offset.z)

          obj.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh
              // No shadow casting needed inside the bubble
              mesh.castShadow = false
              mesh.receiveShadow = false
            }
          })

          this.mesh?.add(obj)
          this.attachedModel = obj
          ktx2Loader.dispose()
          resolve()
        },
        undefined,
        (error) => {
          console.error('Failed to load model', error)
          ktx2Loader.dispose()
          reject(error)
        }
      )
    })
  }

  detachModel(): void {
    if (!this.attachedModel || !this.mesh) return

    this.mesh.remove(this.attachedModel)
    this.attachedModel.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        const mesh = node as THREE.Mesh
        mesh.geometry?.dispose()
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((mat) => mat.dispose())
        } else {
          mesh.material?.dispose()
        }
      }
    })
    this.attachedModel = null
  }

  getModelPath(): string | undefined {
    return this.modelPath
  }

  setFrozen(value: boolean): void {
    this.frozen = value
  }

  isFrozen(): boolean {
    return this.frozen
  }

  dispose(): void {
    this.detachModel()
    super.dispose()
  }
}

export default Mental

