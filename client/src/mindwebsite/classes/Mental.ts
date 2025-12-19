import { AbstractMental } from './AbstractMental'
import type { MentalBaseOptions } from './AbstractMental'

/**
 * Mental class extends AbstractMental
 * Provides a concrete implementation for Mental sphere objects inside the Mind
 */
export class Mental extends AbstractMental {
  constructor(options: MentalBaseOptions = {}) {
    super(options)
    // Initialize the mesh components
    this.createGeometry()
    this.createMaterial()
    this.createMesh()
    
    // Initialize a slow, constant, non-stop drift inside the Mind sphere
    this.normalizeVelocityToMotionSpeed()
  }
}

export default Mental

