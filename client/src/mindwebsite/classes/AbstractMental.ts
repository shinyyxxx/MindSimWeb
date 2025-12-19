import * as THREE from 'three'

export interface MentalBaseOptions {
  name?: string
  detail?: string
  color?: number | string
  scale?: number
  /**
   * Desired constant movement speed in local-space units per frame at 60fps
   * (Mind.updatePhysics multiplies by deltaTime*60 to stay stable across FPS)
   */
  motionSpeed?: number
  /**
   * Show a name label above the sphere (camera-facing).
   */
  labelEnabled?: boolean
  /**
   * Approximate label height in world units.
   */
  labelWorldSize?: number
  /**
   * Additional offset above the sphere surface in world units.
   */
  labelOffset?: number
  metalness?: number
  roughness?: number
  transparent?: boolean
  opacity?: number
  widthSegments?: number
  heightSegments?: number
  position?: { x?: number; y?: number; z?: number } | [number, number, number]
}

/**
 * Abstract base class for Mental sphere objects
 * Provides common functionality for spheres that exist inside the Mind
 */
export class AbstractMental {
  name: string
  detail: string
  color: number
  scale: number
  metalness: number
  roughness: number
  transparent: boolean
  opacity: number
  widthSegments: number
  heightSegments: number
  position: { x: number; y: number; z: number }
  geometry: THREE.SphereGeometry | null
  material: THREE.MeshStandardMaterial | null
  mesh: THREE.Mesh | null
  velocity: { x: number; y: number; z: number }
  radius: number
  motionSpeed: number
  labelEnabled: boolean
  labelWorldSize: number
  labelOffset: number
  private labelSprite: THREE.Sprite | null

  constructor(options: MentalBaseOptions = {}) {
    // Configuration
    this.name = options.name || ''
    this.detail = options.detail || ''
    const colorValue = options.color || 0xff6b9d
    this.color = typeof colorValue === 'string'
      ? parseInt(colorValue.replace('#', ''), 16)
      : colorValue
    this.scale = options.scale || 0.5
    this.metalness = options.metalness || 0.1
    this.roughness = options.roughness || 0.4
    this.transparent = !!options.transparent
    this.opacity = (options.opacity != null) ? options.opacity : 1
    this.widthSegments = options.widthSegments || 64
    this.heightSegments = options.heightSegments || 64
    
    // Position initialization
    if (Array.isArray(options.position)) {
      this.position = {
        x: options.position[0] || 0,
        y: options.position[1] || 0,
        z: options.position[2] || 0
      }
    } else if (options.position) {
      this.position = {
        x: options.position.x || 0,
        y: options.position.y || 0,
        z: options.position.z || 0
      }
    } else {
      this.position = { x: 0, y: 0, z: 0 }
    }
    
    this.geometry = null
    this.material = null
    this.mesh = null
    
    // Physics properties
    this.velocity = { x: 0, y: 0, z: 0 }
    this.radius = this.scale
    this.motionSpeed = options.motionSpeed ?? 0.002

    // Label config
    this.labelEnabled = options.labelEnabled ?? true
    this.labelWorldSize = options.labelWorldSize ?? 0.18
    this.labelOffset = options.labelOffset ?? 0.06
    this.labelSprite = null
  }

  createGeometry(): void {
    this.geometry = new THREE.SphereGeometry(
      1,
      this.widthSegments,
      this.heightSegments
    )
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
    })
  }

  createMesh(): void {
    if (!this.geometry || !this.material) {
      throw new Error('Geometry and material must be created before creating mesh')
    }
    this.mesh = new THREE.Mesh(this.geometry, this.material)
    this.mesh.position.set(this.position.x, this.position.y, this.position.z)
    // Apply the scale to the mesh
    this.mesh.scale.set(this.scale, this.scale, this.scale)

    this.updateLabel()
  }

  setColor(color: number | string): void {
    this.color = typeof color === 'string'
      ? parseInt(color.replace('#', ''), 16)
      : color
    
    if (this.material) {
      this.material.color.setHex(this.color)
    }
  }

  setScale(scale: number): void {
    this.scale = scale
    this.radius = scale
    if (this.mesh) {
      this.mesh.scale.set(scale, scale, scale)
    }

    this.updateLabelTransform()
  }
  
  setVelocity(x: number, y: number, z: number): void {
    this.velocity = { x, y, z }
  }
  
  getVelocity(): { x: number; y: number; z: number } {
    return { ...this.velocity }
  }

  setMotionSpeed(speed: number): void {
    this.motionSpeed = Math.max(0, speed)
  }

  getMotionSpeed(): number {
    return this.motionSpeed
  }

  /**
   * Keeps the mental moving at a constant speed.
   * If velocity is zero, assigns a random direction.
   */
  normalizeVelocityToMotionSpeed(): void {
    const { x, y, z } = this.velocity
    const mag = Math.sqrt(x * x + y * y + z * z)

    if (mag > 0) {
      const s = this.motionSpeed / mag
      this.velocity = { x: x * s, y: y * s, z: z * s }
      return
    }

    if (this.motionSpeed === 0) return

    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(Math.random() * 2 - 1)
    this.velocity = {
      x: this.motionSpeed * Math.sin(phi) * Math.cos(theta),
      y: this.motionSpeed * Math.sin(phi) * Math.sin(theta),
      z: this.motionSpeed * Math.cos(phi)
    }
  }

  private createLabelTexture(text: string): THREE.CanvasTexture {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 256

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      const fallback = new THREE.CanvasTexture(canvas)
      fallback.needsUpdate = true
      return fallback
    }

    // Background
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)'
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)'
    ctx.lineWidth = 6

    const pad = 20
    const r = 22
    const x = pad
    const y = pad
    const w = canvas.width - pad * 2
    const h = canvas.height - pad * 2

    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.arcTo(x + w, y, x + w, y + h, r)
    ctx.arcTo(x + w, y + h, x, y + h, r)
    ctx.arcTo(x, y + h, x, y, r)
    ctx.arcTo(x, y, x + w, y, r)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    // Text
    const safe = text || ''
    let fontSize = 84
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.98)'

    const maxTextWidth = w - 40
    while (fontSize > 26) {
      ctx.font = `700 ${fontSize}px Arial`
      const metrics = ctx.measureText(safe)
      if (metrics.width <= maxTextWidth) break
      fontSize -= 4
    }

    ctx.fillText(safe, canvas.width / 2, canvas.height / 2)

    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    return texture
  }

  private removeLabel(): void {
    if (!this.mesh || !this.labelSprite) return

    this.mesh.remove(this.labelSprite)

    const material = this.labelSprite.material
    if (material instanceof THREE.SpriteMaterial) {
      material.map?.dispose()
      material.dispose()
    }

    this.labelSprite = null
  }

  private updateLabelTransform(): void {
    if (!this.mesh || !this.labelSprite) return

    // Put the label just above the surface, using world-space offset.
    const yLocal = 1 + (this.labelOffset / Math.max(0.00001, this.scale))
    this.labelSprite.position.set(0, yLocal, 0)

    // Keep label size roughly constant in world space, independent of parent scale.
    const s = this.labelWorldSize / Math.max(0.00001, this.scale)
    this.labelSprite.scale.set(s * 2.0, s * 1.0, 1)
  }

  private updateLabel(): void {
    if (!this.mesh) return

    const shouldShow = this.labelEnabled && this.name.trim().length > 0
    if (!shouldShow) {
      this.removeLabel()
      return
    }

    if (!this.labelSprite) {
      const texture = this.createLabelTexture(this.name)
      const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: false,
        depthWrite: false
      })
      this.labelSprite = new THREE.Sprite(material)
      this.labelSprite.renderOrder = 999
      this.mesh.add(this.labelSprite)
    } else {
      const material = this.labelSprite.material
      if (material instanceof THREE.SpriteMaterial) {
        material.map?.dispose()
        material.map = this.createLabelTexture(this.name)
        material.needsUpdate = true
      }
    }

    this.updateLabelTransform()
  }
  
  getRadius(): number {
    return this.radius
  }

  setOpacity(opacity: number): void {
    const clamped = Math.max(0, Math.min(1, opacity))
    this.opacity = clamped
    this.transparent = clamped < 1
    
    if (this.material) {
      this.material.opacity = clamped
      this.material.transparent = this.transparent
      this.material.depthWrite = !this.transparent
      this.material.needsUpdate = true
    }
  }

  setMetalness(value: number): void {
    this.metalness = value
    if (this.material) {
      this.material.metalness = value
    }
  }

  setRoughness(value: number): void {
    this.roughness = value
    if (this.material) {
      this.material.roughness = value
    }
  }

  setPosition(x: number | { x?: number; y?: number; z?: number } | [number, number, number], y?: number, z?: number): void {
    if (Array.isArray(x)) {
      // Array format: [x, y, z]
      this.position = { x: x[0] || 0, y: x[1] || 0, z: x[2] || 0 }
    } else if (typeof x === 'object' && x !== null) {
      // Object format: { x, y, z }
      this.position = {
        x: x.x ?? this.position.x,
        y: x.y ?? this.position.y,
        z: x.z ?? this.position.z
      }
    } else {
      // Individual coordinates: x, y, z
      this.position = {
        x: x,
        y: y ?? this.position.y,
        z: z ?? this.position.z
      }
    }
    
    if (this.mesh) {
      this.mesh.position.set(this.position.x, this.position.y, this.position.z)
    }
  }

  getPosition(): { x: number; y: number; z: number } {
    return { ...this.position }
  }

  setName(name: string): void {
    this.name = name
    this.updateLabel()
  }

  getName(): string {
    return this.name
  }

  setDetail(detail: string): void {
    this.detail = detail
  }

  getDetail(): string {
    return this.detail
  }

  getMesh(): THREE.Mesh | null {
    return this.mesh
  }

  dispose(): void {
    this.removeLabel()
    if (this.geometry) {
      this.geometry.dispose()
    }
    if (this.material) {
      this.material.dispose()
    }
  }
}

// Export as default alias for backward compatibility
export default AbstractMental

