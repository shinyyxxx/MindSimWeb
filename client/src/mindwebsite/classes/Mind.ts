import { AbstractMind } from './AbstractMind'
import type { MindBaseOptions } from './AbstractMind'
import Mental from './Mental'

/**
 * Mind class extends AbstractMind
 * Provides a concrete implementation for Mind sphere objects
 * Can contain Mental spheres inside it
 */
export class Mind extends AbstractMind {
  mentals: Mental[] = []

  constructor(options: MindBaseOptions = {}) {
    super(options)
    // Initialize the mesh components
    this.createGeometry()
    this.createMaterial()
    this.createMesh()
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
      // Collision detected - separate spheres
      const overlap = minDistance - distance
      const separationX = (dx / distance) * overlap * 0.5
      const separationY = (dy / distance) * overlap * 0.5
      const separationZ = (dz / distance) * overlap * 0.5

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
      const normalX = dx / distance
      const normalY = dy / distance
      const normalZ = dz / distance

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
    const mindRadius = this.getRadius()
    const speedMultiplier = deltaTime * 60
    const mindMesh = this.getMesh()
    if (!mindMesh) return

    // Update positions based on velocity with boundary prediction
    this.mentals.forEach((mental) => {
      // Keep constant slow motion forever (if it ever hits 0/NaN, re-seed a direction)
      mental.normalizeVelocityToMotionSpeed()

      const position = mental.getPosition()
      const velocity = mental.getVelocity()
      
      // Mental radius in world space (local radius * Mind scale)
      const mentalRadius = mental.getRadius() * this.scale
      const maxDistance = mindRadius - mentalRadius - 0.01

      // Calculate next position in local space
      const nextX = position.x + velocity.x * speedMultiplier
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
        this.handleCollision(this.mentals[i], this.mentals[j])
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

  /**
   * Override dispose to also dispose all mentals
   */
  dispose(): void {
    // Dispose all mentals first
    this.clearMentals()
    
    // Then dispose the mind itself
    super.dispose()
  }
}

export default Mind

