import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js'
import { AbstractMental } from './AbstractMental'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
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
  private nameTexture: THREE.CanvasTexture | null
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
    this.nameTexture = null
    this.attachedModel = null
    this.frozen = false
    
    // Initialize a slow, constant, non-stop drift inside the Mind sphere
    this.normalizeVelocityToMotionSpeed()
  }

  createMaterial(): void {
    const baseOpacity = Math.min(this.opacity, 0.45)
    const bubbleMaterial = new THREE.MeshPhysicalMaterial({
      color: this.color,
      emissive: this.color,
      emissiveIntensity: 0.7,
      transmission: 1.0,
      thickness: 0.35,
      roughness: 0.05,
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0,
      iridescence: 0.15,
      iridescenceIOR: 1.02,
      iridescenceThicknessRange: [0, 800],
      envMapIntensity: 0,
      transparent: true,
      opacity: baseOpacity,
      ior: 1.2,
      attenuationColor: '#ffffff',
      attenuationDistance: 1.2,
      depthWrite: false,
      side: THREE.DoubleSide
    })
    bubbleMaterial.toneMapped = false

    if (this.name.trim().length > 0) {
      const nameTexture = this.createNameTexture(this.name)
      bubbleMaterial.emissive = new THREE.Color('#ffffff')
      bubbleMaterial.emissiveMap = nameTexture
      bubbleMaterial.emissiveIntensity = 0.65
      bubbleMaterial.transparent = true
      bubbleMaterial.depthWrite = false
      this.nameTexture = nameTexture
    }

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

  override setName(name: string): void {
    super.setName(name)
    this.updateNameTexture()
  }

  private updateNameTexture(): void {
    if (!this.material) return
    // Dispose previous texture to avoid leaks
    if (this.nameTexture) {
      this.nameTexture.dispose()
      this.nameTexture = null
    }
    if (!this.name.trim()) {
      this.material.emissiveMap = null
      this.material.needsUpdate = true
      return
    }
    const tex = this.createNameTexture(this.name)
    this.material.emissive = new THREE.Color('#ffffff')
    this.material.emissiveMap = tex
    this.material.emissiveIntensity = 0.65
    this.material.needsUpdate = true
    this.nameTexture = tex
  }

  private createNameTexture(text: string): THREE.CanvasTexture {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 512

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      const fallback = new THREE.CanvasTexture(canvas)
      fallback.needsUpdate = true
      return fallback
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const label = text.trim() || 'MENTAL'

    // Auto-shrink font to fit safely in the center (smaller start for subtlety)
    let fontSize = 80
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = 'rgba(255,255,255,1)'
    while (fontSize > 32) {
      ctx.font = `700 ${fontSize}px Arial`
      const width = ctx.measureText(label).width
      if (width < canvas.width * 0.85) break
      fontSize -= 6
    }

    ctx.fillText(label, canvas.width / 2, canvas.height / 2)

    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.ClampToEdgeWrapping
    texture.wrapT = THREE.ClampToEdgeWrapping
    texture.repeat.set(1, 1)
    texture.needsUpdate = true
    return texture
  }

  async loadModel(
    renderer: THREE.WebGLRenderer,
    options: {
      basisPath?: string
      dracoPath?: string
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
    const dracoPath = options.dracoPath
      ?? 'https://unpkg.com/three@0.160.0/examples/jsm/libs/draco/'
    const ktx2Loader = new KTX2Loader()
      .setTranscoderPath(basisPath)
      .detectSupport(renderer)
    const dracoLoader = new DRACOLoader().setDecoderPath(dracoPath)
    loader.setKTX2Loader(ktx2Loader)
    loader.setDRACOLoader(dracoLoader)

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
          dracoLoader.dispose()
          resolve()
        },
        undefined,
        (error) => {
          console.error('Failed to load model', error)
          ktx2Loader.dispose()
          dracoLoader.dispose()
          reject(error)
        }
      )
    })
  }

  /**
   * Visualize sending data from this mental to another using a paper plane model.
   * The plane starts at the sender, travels toward the receiver, and disposes on arrival.
   */
  async sendDataTo(
    renderer: THREE.WebGLRenderer,
    target: Mental,
    options: {
      planeModelPath: string
      durationMs?: number
      arcHeight?: number
      scale?: number
      basisPath?: string
      dracoPath?: string
    }
  ): Promise<void> {
    if (!this.mesh || !target.getMesh()) return
    const parent = this.mesh.parent
    if (!parent) return
    const planePath = options.planeModelPath
    if (!planePath) return

    const loader = new GLTFLoader().setCrossOrigin('anonymous')
    const basisPath = options.basisPath
      ?? 'https://unpkg.com/three@0.160.0/examples/jsm/libs/basis/'
    const dracoPath = options.dracoPath
      ?? 'https://unpkg.com/three@0.160.0/examples/jsm/libs/draco/'
    const ktx2Loader = new KTX2Loader()
      .setTranscoderPath(basisPath)
      .detectSupport(renderer)
    const dracoLoader = new DRACOLoader().setDecoderPath(dracoPath)
    loader.setKTX2Loader(ktx2Loader)
    loader.setDRACOLoader(dracoLoader)

    const startWorld = new THREE.Vector3()
    const endWorld = new THREE.Vector3()
    this.mesh.getWorldPosition(startWorld)
    target.getMesh()!.getWorldPosition(endWorld)
    const startLocal = parent.worldToLocal(startWorld.clone())

    return new Promise((resolve, reject) => {
      loader.load(
        planePath,
        (gltf) => {
          const plane = gltf.scene
          const planeScale = options.scale ?? 0.08
          plane.scale.setScalar(planeScale)

          const duration = options.durationMs ?? 1400
          const arcHeight = options.arcHeight ?? 0.12
          const tmpEndLocal = new THREE.Vector3()
          let animationFrame = 0
          let startTime = 0
          let disposed = false

          const disposePlane = () => {
            if (disposed) return
            disposed = true
            cancelAnimationFrame(animationFrame)
            parent.remove(plane)
            plane.traverse((node) => {
              if ((node as THREE.Mesh).isMesh) {
                const mesh = node as THREE.Mesh
                mesh.geometry?.dispose()
                if (Array.isArray(mesh.material)) {
                  mesh.material.forEach((m) => m.dispose())
                } else {
                  mesh.material?.dispose()
                }
              }
            })
            ktx2Loader.dispose()
            dracoLoader.dispose()
            resolve()
          }

          parent.add(plane)
          plane.position.copy(startLocal)

          const step = (timestamp: number) => {
            if (!plane.parent) {
              disposePlane()
              return
            }
            if (!startTime) startTime = timestamp
            const t = Math.min(1, (timestamp - startTime) / duration)

            // Refresh end position to follow the receiver if it moves
            const targetMesh = target.getMesh()
            if (targetMesh) {
              targetMesh.getWorldPosition(endWorld)
              tmpEndLocal.copy(endWorld)
              parent.worldToLocal(tmpEndLocal)
            } else {
              tmpEndLocal.copy(startLocal)
            }

            const pos = startLocal.clone().lerp(tmpEndLocal, t)
            pos.y += Math.sin(Math.PI * t) * arcHeight
            plane.position.copy(pos)

            // Orient plane along the travel direction
            const nextDir = tmpEndLocal.clone().sub(pos).normalize()
            if (nextDir.lengthSq() > 0) {
              const lookAtTarget = pos.clone().add(nextDir)
              plane.lookAt(lookAtTarget)
            }

            if (t < 1) {
              animationFrame = requestAnimationFrame(step)
            } else {
              disposePlane()
            }
          }

          animationFrame = requestAnimationFrame(step)
        },
        undefined,
        (error) => {
          console.error('Failed to send data (plane load)', error)
          ktx2Loader.dispose()
          dracoLoader.dispose()
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
    if (this.nameTexture) {
      this.nameTexture.dispose()
      this.nameTexture = null
    }
    super.dispose()
  }
}

export default Mental

