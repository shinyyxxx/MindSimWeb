import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js'
import { AbstractMental } from './AbstractMental'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import type { MentalBaseOptions } from './AbstractMental'

export class Mental extends AbstractMental {
  modelPath?: string
  modelTargetWorldSize: number
  modelOpacity: number
  modelOffset: { x: number; y: number; z: number }
  private nameTexture: THREE.CanvasTexture | null
  private attachedModel: THREE.Object3D | null
  private frozen: boolean
  private modelVisible: boolean
  private modelLoadToken: number

  constructor(options: MentalBaseOptions = {}) {
    // Default: no floating labels for mentals unless explicitly enabled
    const labelEnabled = options.labelEnabled ?? false
    super({ ...options, labelEnabled })
    this.createGeometry()
    this.createMaterial()
    this.createMesh()
    
    this.modelPath = options.modelPath
    this.modelTargetWorldSize = options.modelTargetWorldSize ?? 0.16
    this.modelOpacity = THREE.MathUtils.clamp(options.modelOpacity ?? 0.1, 0, 1)
    this.modelOffset = {
      x: options.modelOffset?.x ?? 0,
      y: options.modelOffset?.y ?? 0,
      z: options.modelOffset?.z ?? 0
    }
    this.nameTexture = null
    this.attachedModel = null
    this.frozen = false
    this.modelVisible = true
    this.modelLoadToken = 0
    
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
    // Explicitly disable environment map to prevent reflections
    bubbleMaterial.envMap = null

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

  setModelOpacity(opacity: number): void {
    this.modelOpacity = THREE.MathUtils.clamp(opacity, 0, 1)
  }

  setModelOffset(offset: { x?: number; y?: number; z?: number }): void {
    this.modelOffset = {
      x: offset.x ?? this.modelOffset.x,
      y: offset.y ?? this.modelOffset.y,
      z: offset.z ?? this.modelOffset.z
    }
  }

  setModelVisible(visible: boolean): void {
    this.modelVisible = visible
    if (this.mesh) {
      this.mesh.children.forEach((child) => {
        if (child.userData?.isMentalAttachedModel) {
          child.visible = visible
        }
      })
    }
  }

  toggleModelVisible(): boolean {
    this.setModelVisible(!this.modelVisible)
    return this.modelVisible
  }

  isModelVisible(): boolean {
    return this.modelVisible
  }

  /** Hide the GLB attached inside the bubble (sphere stays visible). Safe to call before `loadModel`. */
  hideAttachedFactorModel(): void {
    this.setModelVisible(false)
  }

  /** Show the attached GLB after it has loaded (no-op if nothing attached yet). */
  showAttachedFactorModel(): void {
    this.setModelVisible(true)
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
    let fontSize = 60
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = 'rgba(255,255,255,1)'
    while (fontSize > 32) {
      ctx.font = `500 ${fontSize}px "Segoe UI", "Helvetica Neue", "Arial Narrow", Arial, sans-serif`
      const width = ctx.measureText(label).width
      if (width < canvas.width * 0.85) break
      fontSize -= 6
    }

    ctx.fillText(label, canvas.width / 2, canvas.height / 2)

    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.ClampToEdgeWrapping
    texture.repeat.set(1, 1)
    // Offset so the name (drawn at texture center) appears on the front of the sphere instead of the side
    texture.offset.set(0.25, 0)
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
    const loadToken = ++this.modelLoadToken

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
          if (loadToken !== this.modelLoadToken) {
            ktx2Loader.dispose()
            dracoLoader.dispose()
            resolve()
            return
          }

          // Defensive cleanup in case an older race left extra models behind.
          this.mesh?.children
            .filter((child) => child.userData?.isMentalAttachedModel)
            .forEach((child) => {
              child.traverse((node) => {
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
              this.mesh?.remove(child)
            })

          const obj = gltf.scene
          obj.userData.isMentalAttachedModel = true
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
              if (Array.isArray(mesh.material)) {
                mesh.material.forEach((mat) => {
                  mat.transparent = true
                  mat.opacity = this.modelOpacity
                  mat.depthWrite = false
                  mat.needsUpdate = true
                })
              } else if (mesh.material) {
                mesh.material.transparent = true
                mesh.material.opacity = this.modelOpacity
                mesh.material.depthWrite = false
                mesh.material.needsUpdate = true
              }
            }
          })

          this.mesh?.add(obj)
          obj.visible = this.modelVisible
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
    if (!this.mesh || !target.getMesh()) {
      return Promise.reject(new Error('Missing sender or target mesh'))
    }
    const parent = this.mesh.parent
    if (!parent) {
      return Promise.reject(new Error('Sender mesh has no parent to attach plane'))
    }
    const planePath = options.planeModelPath
    if (!planePath) {
      return Promise.reject(new Error('Missing plane model path'))
    }

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

          // Rainbow trail (simple line with vertex colors)
          const maxTrailPoints = 80
          const trailGeometry = new THREE.BufferGeometry()
          const trailPositions = new Float32Array(maxTrailPoints * 3)
          const trailColors = new Float32Array(maxTrailPoints * 3)
          const positionAttr = new THREE.BufferAttribute(trailPositions, 3)
          const colorAttr = new THREE.BufferAttribute(trailColors, 3)
          trailGeometry.setAttribute('position', positionAttr)
          trailGeometry.setAttribute('color', colorAttr)
          trailGeometry.setDrawRange(0, 0)
          const trailMaterial = new THREE.LineBasicMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            depthWrite: false
          })
          const trailLine = new THREE.Line(trailGeometry, trailMaterial)
          trailLine.frustumCulled = false
          parent.add(trailLine)

          // Wide ribbon (two-triangle quad per segment)
          const ribbonWidth = 0.05
          const ribbonGeometry = new THREE.BufferGeometry()
          const maxRibbonVerts = (maxTrailPoints - 1) * 6 // 2 triangles per segment
          const ribbonPositions = new Float32Array(maxRibbonVerts * 3)
          const ribbonColors = new Float32Array(maxRibbonVerts * 3)
          const ribbonPositionAttr = new THREE.BufferAttribute(ribbonPositions, 3)
          const ribbonColorAttr = new THREE.BufferAttribute(ribbonColors, 3)
          ribbonGeometry.setAttribute('position', ribbonPositionAttr)
          ribbonGeometry.setAttribute('color', ribbonColorAttr)
          ribbonGeometry.setDrawRange(0, 0)
          const ribbonMaterial = new THREE.MeshBasicMaterial({
            vertexColors: true,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.5,
            blending: THREE.AdditiveBlending,
            depthWrite: false
          })
          const ribbonMesh = new THREE.Mesh(ribbonGeometry, ribbonMaterial)
          ribbonMesh.frustumCulled = false
          parent.add(ribbonMesh)

          const trailPoints: THREE.Vector3[] = []
          const rainbowStops = [
            new THREE.Color('#ff0048'),
            new THREE.Color('#ff7a00'),
            new THREE.Color('#ffeb00'),
            new THREE.Color('#28e300'),
            new THREE.Color('#00d8ff'),
            new THREE.Color('#005dff'),
            new THREE.Color('#b400ff')
          ]
          const upVec = new THREE.Vector3(0, 1, 0)
          const pushTrailPoint = (pt: THREE.Vector3) => {
            trailPoints.push(pt.clone())
            if (trailPoints.length > maxTrailPoints) trailPoints.shift()

            // Update positions
            for (let i = 0; i < trailPoints.length; i++) {
              const p = trailPoints[i]
              const idx = i * 3
              trailPositions[idx] = p.x
              trailPositions[idx + 1] = p.y
              trailPositions[idx + 2] = p.z
            }
            positionAttr.needsUpdate = true
            trailGeometry.setDrawRange(0, trailPoints.length)

            // Update rainbow vertex colors along the trail (head->tail)
            const stopCount = rainbowStops.length - 1
            for (let i = 0; i < trailPoints.length; i++) {
              const t = i / Math.max(1, trailPoints.length - 1)
              const scaled = t * stopCount
              const base = Math.floor(scaled)
              const lerpT = scaled - base
              const c1 = rainbowStops[base]
              const c2 = rainbowStops[Math.min(base + 1, stopCount)]
              const r = THREE.MathUtils.lerp(c1.r, c2.r, lerpT)
              const g = THREE.MathUtils.lerp(c1.g, c2.g, lerpT)
              const b = THREE.MathUtils.lerp(c1.b, c2.b, lerpT)
              const ci = i * 3
              trailColors[ci] = r
              trailColors[ci + 1] = g
              trailColors[ci + 2] = b
            }
            colorAttr.needsUpdate = true

            // Update ribbon quad vertices for width
            const segCount = Math.max(0, trailPoints.length - 1)
            let v = 0
            for (let i = 0; i < segCount; i++) {
              const p0 = trailPoints[i]
              const p1 = trailPoints[i + 1]
              const dir = p1.clone().sub(p0)
              const side = dir.lengthSq() < 1e-6
                ? new THREE.Vector3(1, 0, 0)
                : dir.clone().cross(upVec).normalize()
              side.multiplyScalar(ribbonWidth * 0.5)

              const a = p0.clone().add(side)
              const b = p0.clone().sub(side)
              const c = p1.clone().add(side)
              const d = p1.clone().sub(side)

              const t0 = i / Math.max(1, trailPoints.length - 1)
              const t1 = (i + 1) / Math.max(1, trailPoints.length - 1)
              const segColor0 = (() => {
                const scaled = t0 * (rainbowStops.length - 1)
                const base = Math.floor(scaled)
                const lerpT = scaled - base
                const c1 = rainbowStops[base]
                const c2 = rainbowStops[Math.min(base + 1, rainbowStops.length - 1)]
                return new THREE.Color(
                  THREE.MathUtils.lerp(c1.r, c2.r, lerpT),
                  THREE.MathUtils.lerp(c1.g, c2.g, lerpT),
                  THREE.MathUtils.lerp(c1.b, c2.b, lerpT)
                )
              })()
              const segColor1 = (() => {
                const scaled = t1 * (rainbowStops.length - 1)
                const base = Math.floor(scaled)
                const lerpT = scaled - base
                const c1 = rainbowStops[base]
                const c2 = rainbowStops[Math.min(base + 1, rainbowStops.length - 1)]
                return new THREE.Color(
                  THREE.MathUtils.lerp(c1.r, c2.r, lerpT),
                  THREE.MathUtils.lerp(c1.g, c2.g, lerpT),
                  THREE.MathUtils.lerp(c1.b, c2.b, lerpT)
                )
              })()

              const writeVert = (vec: THREE.Vector3, col: THREE.Color) => {
                ribbonPositions[v * 3] = vec.x
                ribbonPositions[v * 3 + 1] = vec.y
                ribbonPositions[v * 3 + 2] = vec.z
                ribbonColors[v * 3] = col.r
                ribbonColors[v * 3 + 1] = col.g
                ribbonColors[v * 3 + 2] = col.b
                v++
              }

              // Triangle 1: a, c, b
              writeVert(a, segColor0)
              writeVert(c, segColor1)
              writeVert(b, segColor0)
              // Triangle 2: b, c, d
              writeVert(b, segColor0)
              writeVert(c, segColor1)
              writeVert(d, segColor1)
            }
            ribbonPositionAttr.needsUpdate = true
            ribbonColorAttr.needsUpdate = true
            ribbonGeometry.setDrawRange(0, Math.max(0, (trailPoints.length - 1) * 6))
          }

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
            if (trailLine.parent) {
              trailLine.parent.remove(trailLine)
            }
            if (ribbonMesh.parent) {
              ribbonMesh.parent.remove(ribbonMesh)
            }
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
            trailGeometry.dispose()
            trailMaterial.dispose()
            ribbonGeometry.dispose()
            ribbonMaterial.dispose()
            ktx2Loader.dispose()
            dracoLoader.dispose()
            resolve()
          }

          parent.add(plane)
          plane.position.copy(startLocal)
          pushTrailPoint(plane.position)

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
            pushTrailPoint(plane.position)

            // Orient plane along the travel direction
            const nextDir = tmpEndLocal.clone().sub(pos).normalize()
            if (nextDir.lengthSq() > 0) {
              // Align model's -Z (typical GLTF forward) to travel direction
              const forward = new THREE.Vector3(0, 0, -1)
              const quat = new THREE.Quaternion().setFromUnitVectors(forward, nextDir)
              plane.setRotationFromQuaternion(quat)
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
    this.modelLoadToken += 1
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

  getWorldPosition(): THREE.Vector3 | null {
    const mesh = this.getMesh()
    if (!mesh) return null
    const pos = new THREE.Vector3()
    mesh.getWorldPosition(pos)
    return pos
  }

  getScreenPosition(camera: THREE.Camera, renderer: THREE.WebGLRenderer): { x: number; y: number } | null {
    const worldPos = this.getWorldPosition()
    if (!worldPos) return null
    const ndc = worldPos.clone().project(camera)
    const rect = renderer.domElement.getBoundingClientRect()
    return {
      x: rect.left + (ndc.x + 1) * 0.5 * rect.width + window.scrollX,
      y: rect.top + (1 - (ndc.y + 1) * 0.5) * rect.height + window.scrollY
    }
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

