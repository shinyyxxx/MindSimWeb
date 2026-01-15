import * as THREE from 'three'
import NeutralMental from './NeutralMental'
import type { MentalBaseOptions } from '../AbstractMental'

type PerceptionAttribute = {
  key: string
  value: string
  marker?: THREE.Mesh
}

/**
 * A neutral-derived mental representing perception.
 */
export class PerceptionMental extends NeutralMental {
  private attributes: PerceptionAttribute[] = []

  constructor(options: MentalBaseOptions = {}) {
    super({
      name: options.name ?? 'Perception',
      detail: options.detail ?? 'Perceptual processing',
      color: options.color ?? '#60a5fa',
      motionSpeed: options.motionSpeed ?? 0.002,
      opacity: options.opacity ?? 0.55,
      ...options,
    })
  }

  override getType(): string {
    return 'perception_mental'
  }

  getAttributes(): Array<{ key: string; value: string }> {
    return this.attributes.map(({ key, value }) => ({ key, value }))
  }

  addAttribute(key: string, value: string): void {
    const trimmedKey = key.trim()
    if (!trimmedKey) return
    this.removeAttribute(trimmedKey)

    const marker = this.createMarker()
    this.attributes.push({ key: trimmedKey, value, marker })
    if (marker) {
      const mesh = this.getMesh()
      if (mesh) {
        mesh.add(marker)
      }
    }
  }

  getAttributeMarkers(): Array<{ key: string; value: string; position: { x: number; y: number; z: number } }> {
    return this.attributes
      .filter((a) => !!a.marker)
      .map((a) => ({
        key: a.key,
        value: a.value,
        position: {
          x: a.marker!.position.x,
          y: a.marker!.position.y,
          z: a.marker!.position.z,
        },
      }))
  }

  removeAttribute(key: string): void {
    const idx = this.attributes.findIndex((a) => a.key === key)
    if (idx >= 0) {
      const [attr] = this.attributes.splice(idx, 1)
      if (attr.marker && this.getMesh()) {
        this.getMesh()!.remove(attr.marker)
        attr.marker.geometry.dispose()
        if (Array.isArray(attr.marker.material)) {
          attr.marker.material.forEach((m) => m.dispose())
        } else {
          attr.marker.material.dispose()
        }
      }
    }
  }

  private createMarker(): THREE.Mesh {
    const geometry = new THREE.SphereGeometry(0.05, 32, 32)
    const material = new THREE.MeshStandardMaterial({
      color: '#f59e0b',
      emissive: '#92400e',
      emissiveIntensity: 0.2,
      roughness: 0.3,
      metalness: 0.1,
    })
    const marker = new THREE.Mesh(geometry, material)

    // Place marker near the deepest point of the bowl (lower and tighter cluster)
    const r = 0.15
    const theta = Math.random() * Math.PI * 2
    const baseY = -0.18
    const y = baseY + (Math.random() - 0.5) * 0.04
    const x = Math.cos(theta) * r * 0.25
    const z = Math.sin(theta) * r * 0.25
    marker.position.set(x, y, z)
    marker.castShadow = false
    marker.receiveShadow = false
    return marker
  }

  override dispose(): void {
    this.attributes.forEach((attr) => {
      if (attr.marker) {
        if (this.getMesh()) {
          this.getMesh()!.remove(attr.marker)
        }
        attr.marker.geometry.dispose()
        if (Array.isArray(attr.marker.material)) {
          attr.marker.material.forEach((m) => m.dispose())
        } else {
          attr.marker.material.dispose()
        }
      }
    })
    this.attributes = []
    super.dispose()
  }
}

export default PerceptionMental


