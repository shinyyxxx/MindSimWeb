import { AbstractMind } from './AbstractMind'
import type { MindBaseOptions } from './AbstractMind'
import Mental from './Mental'
import * as THREE from 'three'

/**
 * Mind class extends AbstractMind
 * Provides a concrete implementation for Mind sphere objects
 * Can contain Mental spheres inside it
 */
export class Mind extends AbstractMind {
  mentals: Mental[] = []
  private explanationRunId = 0
  private explanationPromise: Promise<void> | null = null
  private explanationSuspendPhysics = false

  constructor(options: MindBaseOptions = {}) {
    super(options)
    // Initialize the mesh components
    this.createGeometry()
    this.createMaterial()
    this.createMesh()
  }

  createMaterial(): void {
    const baseOpacity = Math.min(this.opacity, 1)
    this.material = new THREE.MeshPhysicalMaterial({
      color: this.color,
      transmission: 1,
      thickness: 1.0,
      roughness: 0.2, // Maximum roughness = matte surface with no reflections
      metalness: 0,
      transparent: true,
      opacity: baseOpacity,
      ior: 2,
      side: THREE.DoubleSide,
      depthWrite: false,
      envMapIntensity: 0,
    })
    // Set envMap to null initially
    this.material.envMap = null
  }

  createMesh(): void {
    super.createMesh()
    if (this.mesh) {
      this.mesh.castShadow = true
      this.mesh.receiveShadow = true
    }
  }

  /**
   * Get the radius of the Mind sphere (considering scale)
   */
  getRadius(): number {
    // Base radius is 1, multiplied by scale
    return this.scale
  }

  /**
   * Constrain a Mental sphere's position to be inside the Mind sphere
   * @param mental The Mental instance to constrain
   */
  constrainMentalPosition(mental: Mental): void {
    const mindRadius = this.getRadius()
    // Mental radius in world space (local radius * Mind scale)
    const mentalRadius = mental.getRadius() * this.scale
    // Reduced margin to allow Mental spheres closer to boundary
    const maxDistance = Math.max(mentalRadius + 0.005, mindRadius - mentalRadius - 0.01)

    // Get local position and convert to world space for distance check
    const position = mental.getPosition()
    const worldX = position.x * this.scale
    const worldY = position.y * this.scale
    const worldZ = position.z * this.scale
    const distance = Math.sqrt(worldX * worldX + worldY * worldY + worldZ * worldZ)

    if (distance > maxDistance || distance === 0) {
      if (distance > 0) {
        // Calculate normal in local space
        const localDistance = Math.sqrt(
          position.x * position.x +
          position.y * position.y +
          position.z * position.z
        )
        const normalX = localDistance > 0 ? position.x / localDistance : 1
        const normalY = localDistance > 0 ? position.y / localDistance : 0
        const normalZ = localDistance > 0 ? position.z / localDistance : 0

        // Convert world-space maxDistance to local space
        const localMaxDistance = maxDistance / this.scale
        
        // Force set position in local space
        mental.setPosition(
          normalX * localMaxDistance,
          normalY * localMaxDistance,
          normalZ * localMaxDistance
        )
      } else {
        // At center, give it a small random position (in local space)
        const localMaxDistance = maxDistance / this.scale
        const randomRadius = Math.random() * localMaxDistance * 0.3
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(Math.random() * 2 - 1)
        const newX = randomRadius * Math.sin(phi) * Math.cos(theta)
        const newY = randomRadius * Math.sin(phi) * Math.sin(theta)
        const newZ = randomRadius * Math.cos(phi)
        
        mental.setPosition(newX, newY, newZ)
      }
    }
  }

  /**
   * Check and handle collision between two mental spheres
   * @param mental1 First mental sphere
   * @param mental2 Second mental sphere
   */
  handleCollision(mental1: Mental, mental2: Mental): void {
    const pos1 = mental1.getPosition()
    const pos2 = mental2.getPosition()
    const vel1 = mental1.getVelocity()
    const vel2 = mental2.getVelocity()
    const radius1 = mental1.getRadius()
    const radius2 = mental2.getRadius()

    const dx = pos2.x - pos1.x
    const dy = pos2.y - pos1.y
    const dz = pos2.z - pos1.z
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)
    const minDistance = radius1 + radius2

    if (distance < minDistance && distance > 0) {
      const isFrozen1 = mental1.isFrozen()
      const isFrozen2 = mental2.isFrozen()
      
      // Collision detected - separate spheres
      const overlap = minDistance - distance
      const normalX = dx / distance
      const normalY = dy / distance
      const normalZ = dz / distance
      
      // If one is frozen, only move the non-frozen one
      if (isFrozen1 && !isFrozen2) {
        // Only move mental2 away from frozen mental1
        const separationX = normalX * overlap
        const separationY = normalY * overlap
        const separationZ = normalZ * overlap
        
        mental2.setPosition(
          pos2.x + separationX,
          pos2.y + separationY,
          pos2.z + separationZ
        )
        
        const mesh2 = mental2.getMesh()
        if (mesh2) {
          mesh2.position.set(
            pos2.x + separationX,
            pos2.y + separationY,
            pos2.z + separationZ
          )
        }
        
        // Bounce the non-frozen sphere off the frozen one
        const dotProduct = vel2.x * normalX + vel2.y * normalY + vel2.z * normalZ
        if (dotProduct < 0) {
          const bounceStrength = 0.9
          const impulse = dotProduct * (1 + bounceStrength)
          const newVel2X = vel2.x - impulse * normalX
          const newVel2Y = vel2.y - impulse * normalY
          const newVel2Z = vel2.z - impulse * normalZ
          mental2.setVelocity(newVel2X, newVel2Y, newVel2Z)
          mental2.normalizeVelocityToMotionSpeed()
        }
      } else if (isFrozen2 && !isFrozen1) {
        // Only move mental1 away from frozen mental2
        const separationX = -normalX * overlap
        const separationY = -normalY * overlap
        const separationZ = -normalZ * overlap
        
        mental1.setPosition(
          pos1.x + separationX,
          pos1.y + separationY,
          pos1.z + separationZ
        )
        
        const mesh1 = mental1.getMesh()
        if (mesh1) {
          mesh1.position.set(
            pos1.x + separationX,
            pos1.y + separationY,
            pos1.z + separationZ
          )
        }
        
        // Bounce the non-frozen sphere off the frozen one
        const dotProduct = vel1.x * normalX + vel1.y * normalY + vel1.z * normalZ
        if (dotProduct > 0) {
          const bounceStrength = 0.9
          const impulse = dotProduct * (1 + bounceStrength)
          const newVel1X = vel1.x - impulse * normalX
          const newVel1Y = vel1.y - impulse * normalY
          const newVel1Z = vel1.z - impulse * normalZ
          mental1.setVelocity(newVel1X, newVel1Y, newVel1Z)
          mental1.normalizeVelocityToMotionSpeed()
        }
      } else {
        // Both are non-frozen - normal collision handling
        const separationX = normalX * overlap * 0.5
        const separationY = normalY * overlap * 0.5
        const separationZ = normalZ * overlap * 0.5

        // Move spheres apart
        mental1.setPosition(
          pos1.x - separationX,
          pos1.y - separationY,
          pos1.z - separationZ
        )
        mental2.setPosition(
          pos2.x + separationX,
          pos2.y + separationY,
          pos2.z + separationZ
        )

        // Update mesh positions
        const mesh1 = mental1.getMesh()
        const mesh2 = mental2.getMesh()
        if (mesh1) {
          mesh1.position.set(
            pos1.x - separationX,
            pos1.y - separationY,
            pos1.z - separationZ
          )
        }
        if (mesh2) {
          mesh2.position.set(
            pos2.x + separationX,
            pos2.y + separationY,
            pos2.z + separationZ
          )
        }

        // Bounce off each other - simple elastic collision
        // Relative velocity
        const relVelX = vel2.x - vel1.x
        const relVelY = vel2.y - vel1.y
        const relVelZ = vel2.z - vel1.z

        // Dot product of relative velocity and normal
        const dotProduct = relVelX * normalX + relVelY * normalY + relVelZ * normalZ

        // Only bounce if moving towards each other
        if (dotProduct < 0) {
          const bounceStrength = 0.9 // Higher bounce strength
          // Use proper elastic collision formula: v' = v - (1 + e)(v·n)n
          const impulse = dotProduct * (1 + bounceStrength)

          // Update velocities
          const newVel1X = vel1.x + impulse * normalX
          const newVel1Y = vel1.y + impulse * normalY
          const newVel1Z = vel1.z + impulse * normalZ
          
          const newVel2X = vel2.x - impulse * normalX
          const newVel2Y = vel2.y - impulse * normalY
          const newVel2Z = vel2.z - impulse * normalZ
          
          mental1.setVelocity(newVel1X, newVel1Y, newVel1Z)
          mental2.setVelocity(newVel2X, newVel2Y, newVel2Z)

          // Keep constant slow motion (no boosting/acceleration)
          mental1.normalizeVelocityToMotionSpeed()
          mental2.normalizeVelocityToMotionSpeed()
        }
      }
    }
  }

  /**
   * Handle boundary collision - bounce off mind sphere walls
   * @param mental The Mental instance to check
   */
  handleBoundaryCollision(mental: Mental): void {
    const mindRadius = this.getRadius()
    // Mental radius in world space (local radius * Mind scale)
    const mentalRadius = mental.getRadius() * this.scale
    const maxDistance = mindRadius - mentalRadius - 0.01

    // Get local position and convert to world space for distance check
    const position = mental.getPosition()
    const worldX = position.x * this.scale
    const worldY = position.y * this.scale
    const worldZ = position.z * this.scale
    const distance = Math.sqrt(worldX * worldX + worldY * worldY + worldZ * worldZ)

    // Check if sphere is at or beyond the boundary
    if (distance >= maxDistance) {
      // Calculate normal vector in local space
      const localDistance = Math.sqrt(
        position.x * position.x +
        position.y * position.y +
        position.z * position.z
      )
      
      const normalX = localDistance > 0 ? position.x / localDistance : 1
      const normalY = localDistance > 0 ? position.y / localDistance : 0
      const normalZ = localDistance > 0 ? position.z / localDistance : 0

      // Constrain position to be inside the boundary (in local space)
      const localMaxDistance = maxDistance / this.scale
      mental.setPosition(
        normalX * localMaxDistance,
        normalY * localMaxDistance,
        normalZ * localMaxDistance
      )

      // Always bounce off boundary - ensure velocity points inward (away from boundary)
      const velocity = mental.getVelocity()
      const dotProduct = velocity.x * normalX + velocity.y * normalY + velocity.z * normalZ

      const bounceStrength = 0.95
      
      // If velocity is pointing outward (dotProduct > 0), reflect it
      // If velocity is pointing inward (dotProduct <= 0) but sphere is at boundary, ensure it moves inward with minimum speed
      if (dotProduct > 0) {
        // Reflect outward velocity
        const newVelX = velocity.x - (1 + bounceStrength) * dotProduct * normalX
        const newVelY = velocity.y - (1 + bounceStrength) * dotProduct * normalY
        const newVelZ = velocity.z - (1 + bounceStrength) * dotProduct * normalZ

        mental.setVelocity(newVelX, newVelY, newVelZ)
      } else {
        // Velocity already pointing inward: keep direction, and just re-normalize speed.
        const tangentialVelX = velocity.x - dotProduct * normalX
        const tangentialVelY = velocity.y - dotProduct * normalY
        const tangentialVelZ = velocity.z - dotProduct * normalZ
        mental.setVelocity(tangentialVelX, tangentialVelY, tangentialVelZ)
      }

      mental.normalizeVelocityToMotionSpeed()
    }
  }

  /**
   * Update physics for all mental spheres
   * Call this every frame in the animation loop
   */
  updatePhysics(deltaTime: number = 0.016): void {
    // Continuously reset envMap to null to prevent Environment from applying reflections
    if (this.material) {
      this.material.envMap = null
    }

    if (this.explanationSuspendPhysics) return
    
    const mindRadius = this.getRadius()
    const speedMultiplier = deltaTime * 60
    const mindMesh = this.getMesh()
    if (!mindMesh) return

    // Update positions based on velocity with boundary prediction
    this.mentals.forEach((mental) => {
      if (mental.isFrozen()) {
        // Keep frozen mentals anchored; zero velocity to avoid drift
        mental.setVelocity(0, 0, 0)
        return
      }

      // Keep constant slow motion forever (if it ever hits 0/NaN, re-seed a direction)
      mental.normalizeVelocityToMotionSpeed()

      const position = mental.getPosition()
      const velocity = mental.getVelocity()
      
      // Mental radius in world space (local radius * Mind scale)
      const mentalRadius = mental.getRadius() * this.scale
      const maxDistance = mindRadius - mentalRadius - 0.01

      // Calculate next position in local space
      let nextX = position.x + velocity.x * speedMultiplier
      const nextY = position.y + velocity.y * speedMultiplier
      const nextZ = position.z + velocity.z * speedMultiplier

      // Convert next position to world space for boundary check
      // Since Mental is a child of Mind, world position = local position * Mind scale
      const nextWorldX = nextX * this.scale
      const nextWorldY = nextY * this.scale
      const nextWorldZ = nextZ * this.scale
      const nextDistance = Math.sqrt(nextWorldX * nextWorldX + nextWorldY * nextWorldY + nextWorldZ * nextWorldZ)

      if (nextDistance > maxDistance) {
        // Use the *next* direction for the boundary normal so tangential motion
        // doesn't get "stuck" by snapping to the same boundary point every frame.
        const nextLocalDistance = Math.sqrt(nextX * nextX + nextY * nextY + nextZ * nextZ)
        const normalX = nextLocalDistance > 0 ? nextX / nextLocalDistance : 1
        const normalY = nextLocalDistance > 0 ? nextY / nextLocalDistance : 0
        const normalZ = nextLocalDistance > 0 ? nextZ / nextLocalDistance : 0

        // Reverse velocity component pointing outward
        const dotProduct = velocity.x * normalX + velocity.y * normalY + velocity.z * normalZ
        const bounceStrength = 0.95 // coefficient of restitution-ish

        // Reflect only if heading outward; otherwise keep direction and just clamp position.
        if (dotProduct > 0) {
          // Reflect velocity: v' = v - (1 + e)(v·n)n
          const newVelX = velocity.x - (1 + bounceStrength) * dotProduct * normalX
          const newVelY = velocity.y - (1 + bounceStrength) * dotProduct * normalY
          const newVelZ = velocity.z - (1 + bounceStrength) * dotProduct * normalZ
          
          mental.setVelocity(newVelX, newVelY, newVelZ)
        }

        // Re-normalize to constant slow speed (no stopping)
        mental.normalizeVelocityToMotionSpeed()

        // Clamp using the next-direction normal (lets the sphere keep sliding around)
        const localMaxDistance = maxDistance / this.scale
        mental.setPosition(normalX * localMaxDistance, normalY * localMaxDistance, normalZ * localMaxDistance)
      } else {
        // Safe to update position normally
        mental.setPosition(nextX, nextY, nextZ)
      }
    })

    // Check collisions between all pairs of mental spheres
    for (let i = 0; i < this.mentals.length; i++) {
      for (let j = i + 1; j < this.mentals.length; j++) {
        const a = this.mentals[i]
        const b = this.mentals[j]
        // Skip collision check only if BOTH are frozen (universal factors don't collide with each other)
        // But allow collisions between frozen and non-frozen spheres
        if (a.isFrozen() && b.isFrozen()) continue
        this.handleCollision(a, b)
      }
    }

    // Final clamp: just ensure nobody escaped numerically.
    // (We avoid snapping/bouncing here to prevent "sticking" artifacts.)
    this.mentals.forEach(mental => {
      this.constrainMentalPosition(mental)
      mental.normalizeVelocityToMotionSpeed()
    })
  }

  /**
   * Add a Mental sphere to this Mind
   * @param mental The Mental instance to add
   */
  addMental(mental: Mental): void {
    if (!this.mentals.includes(mental)) {
      this.mentals.push(mental)
      
      // Constrain position to be inside the Mind sphere
      this.constrainMentalPosition(mental)
      
      // Add the mental's mesh as a child of the mind's mesh
      const mentalMesh = mental.getMesh()
      const mindMesh = this.getMesh()
      
      if (mentalMesh && mindMesh) {
        // Ensure the mental mesh is properly scaled relative to the mind
        // The mental's scale is already set, but we need to make sure it's visible
        // Position is relative to the mind's center
        mindMesh.add(mentalMesh)
      }
    }
  }

  /**
   * Remove a Mental sphere from this Mind
   * @param mental The Mental instance to remove
   */
  removeMental(mental: Mental): void {
    const index = this.mentals.indexOf(mental)
    if (index !== -1) {
      this.mentals.splice(index, 1)
      
      // Remove the mental's mesh from the mind's mesh
      const mentalMesh = mental.getMesh()
      const mindMesh = this.getMesh()
      
      if (mentalMesh && mindMesh) {
        mindMesh.remove(mentalMesh)
      }
    }
  }

  /**
   * Get all Mental spheres in this Mind
   * @returns Array of Mental instances
   */
  getMentals(): Mental[] {
    return [...this.mentals]
  }

  /**
   * Get a Mental sphere by index
   * @param index The index of the Mental to retrieve
   * @returns The Mental instance or undefined
   */
  getMental(index: number): Mental | undefined {
    return this.mentals[index]
  }

  /**
   * Get a Mental sphere by name
   * @param name The name of the Mental to find
   * @returns The Mental instance or undefined
   */
  getMentalByName(name: string): Mental | undefined {
    return this.mentals.find(mental => mental.getName() === name)
  }

  /**
   * Remove all Mental spheres from this Mind
   */
  clearMentals(): void {
    // Dispose and remove all mentals
    this.mentals.forEach(mental => {
      const mentalMesh = mental.getMesh()
      const mindMesh = this.getMesh()
      
      if (mentalMesh && mindMesh) {
        mindMesh.remove(mentalMesh)
      }
      mental.dispose()
    })
    
    this.mentals = []
  }

  /**
   * Get the count of Mental spheres in this Mind
   * @returns The number of Mental instances
   */
  getMentalCount(): number {
    return this.mentals.length
  }

  private waitMs(ms: number, runId: number): Promise<void> {
    if (ms <= 0) return Promise.resolve()
    return new Promise((resolve) => {
      const startedAt = typeof performance !== 'undefined' ? performance.now() : Date.now()
      const step = (now: number) => {
        if (runId !== this.explanationRunId) {
          resolve()
          return
        }
        if (now - startedAt >= ms) {
          resolve()
          return
        }
        requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    })
  }

  private animateMentalTo(
    mental: Mental,
    from: THREE.Vector3,
    to: THREE.Vector3,
    durationMs: number,
    runId: number
  ): Promise<void> {
    if (durationMs <= 0) {
      mental.setPosition(to.x, to.y, to.z)
      return Promise.resolve()
    }

    return new Promise((resolve) => {
      const startedAt = typeof performance !== 'undefined' ? performance.now() : Date.now()
      const step = (now: number) => {
        if (runId !== this.explanationRunId) {
          resolve()
          return
        }

        const rawT = Math.min(1, (now - startedAt) / durationMs)
        const easedT = 1 - Math.pow(1 - rawT, 3)
        const nextX = THREE.MathUtils.lerp(from.x, to.x, easedT)
        const nextY = THREE.MathUtils.lerp(from.y, to.y, easedT)
        const nextZ = THREE.MathUtils.lerp(from.z, to.z, easedT)
        mental.setPosition(nextX, nextY, nextZ)

        if (rawT >= 1) {
          resolve()
          return
        }
        requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    })
  }

  stopMentalExplanationAnimation(): void {
    this.explanationRunId += 1
    this.explanationSuspendPhysics = false
    this.explanationPromise = null
  }

  async explainMindMentalsAnimation(options?: {
    outDurationMs?: number
    holdDurationMs?: number
    returnDurationMs?: number
    outDistanceWorld?: number
    presentationDirectionLocal?: THREE.Vector3 | { x: number; y: number; z: number }
    presentationSpread?: number
    onStart?: () => void | Promise<void>
    onMentalFocus?: (payload: { mental: Mental; index: number; total: number }) => void | Promise<void>
    onComplete?: () => void | Promise<void>
  }): Promise<void> {
    this.stopMentalExplanationAnimation()
    const runId = this.explanationRunId

    const outDurationMs = options?.outDurationMs ?? 650
    const holdDurationMs = options?.holdDurationMs ?? 420
    const returnDurationMs = options?.returnDurationMs ?? 560
    const outDistanceWorld = options?.outDistanceWorld ?? 0.45
    const presentationSpread = options?.presentationSpread ?? 0.08

    const mentals = this.getMentals()
    if (!mentals.length) return

    const customDirection = options?.presentationDirectionLocal
      ? new THREE.Vector3(
          options.presentationDirectionLocal.x,
          options.presentationDirectionLocal.y,
          options.presentationDirectionLocal.z
        )
      : null
    if (customDirection && customDirection.lengthSq() < 1e-8) customDirection.set(-1, 0.18, 0.24)
    customDirection?.normalize()

    const spreadSide = new THREE.Vector3()
    const spreadLift = new THREE.Vector3()
    if (customDirection) {
      const refUp = Math.abs(customDirection.y) > 0.95 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0)
      spreadSide.crossVectors(customDirection, refUp).normalize()
      spreadLift.crossVectors(spreadSide, customDirection).normalize()
    }

    const snapshots = mentals.map((mental, index) => {
      const p = mental.getPosition()
      const v = mental.getVelocity()
      const dir = new THREE.Vector3()
      if (customDirection) {
        const centered = mentals.length > 1 ? (index / (mentals.length - 1)) - 0.5 : 0
        const fan = centered * presentationSpread
        const bob = Math.sin(index * 1.7) * presentationSpread * 0.3
        dir
          .copy(customDirection)
          .addScaledVector(spreadSide, fan)
          .addScaledVector(spreadLift, bob)
      } else {
        dir.set(p.x, p.y, p.z)
        if (dir.lengthSq() < 1e-8) {
          const angle = (index / Math.max(1, mentals.length)) * Math.PI * 2
          dir.set(Math.cos(angle), 0.2, Math.sin(angle))
        }
      }
      dir.normalize()
      return {
        mental,
        start: new THREE.Vector3(p.x, p.y, p.z),
        velocity: v,
        wasFrozen: mental.isFrozen(),
        outwardDir: dir,
      }
    })

    this.explanationSuspendPhysics = true
    snapshots.forEach(({ mental }) => {
      mental.setFrozen(true)
      mental.setVelocity(0, 0, 0)
    })

    this.explanationPromise = (async () => {
      try {
        await options?.onStart?.()
        if (runId !== this.explanationRunId) return
        const outDistanceLocal = outDistanceWorld / Math.max(0.00001, this.scale)

        for (let i = 0; i < snapshots.length; i += 1) {
          const snapshot = snapshots[i]
          if (runId !== this.explanationRunId) return

          const bubbleRadiusLocal = snapshot.mental.getRadius()
          const targetRadiusLocal = 1 + bubbleRadiusLocal + outDistanceLocal
          const target = snapshot.outwardDir.clone().multiplyScalar(targetRadiusLocal)

          await this.animateMentalTo(snapshot.mental, snapshot.start, target, outDurationMs, runId)
          if (runId !== this.explanationRunId) return
          await options?.onMentalFocus?.({ mental: snapshot.mental, index: i, total: snapshots.length })
          if (runId !== this.explanationRunId) return
          await this.waitMs(holdDurationMs, runId)
          await this.animateMentalTo(snapshot.mental, target, snapshot.start, returnDurationMs, runId)
          await this.waitMs(120, runId)
        }
        await options?.onComplete?.()
      } finally {
        snapshots.forEach(({ mental, start, velocity, wasFrozen }) => {
          mental.setPosition(start.x, start.y, start.z)
          mental.setVelocity(velocity.x, velocity.y, velocity.z)
          mental.setFrozen(wasFrozen)
        })
        if (runId === this.explanationRunId) {
          this.explanationSuspendPhysics = false
          this.explanationPromise = null
        }
      }
    })()

    await this.explanationPromise
  }

  /**
   * Override dispose to also dispose all mentals
   */
  dispose(): void {
    this.stopMentalExplanationAnimation()
    // Dispose all mentals first
    this.clearMentals()
    
    // Then dispose the mind itself
    super.dispose()
  }
}

export default Mind

