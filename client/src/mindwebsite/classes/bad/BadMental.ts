import Mental from '../Mental'
import type { MentalBaseOptions } from '../AbstractMental'

/**
 * A "bad" mental sphere with a warning color and slightly more energetic motion.
 */
export class BadMental extends Mental {
  constructor(options: MentalBaseOptions = {}) {
    super({
      color: '#ef4444',
      motionSpeed: options.motionSpeed ?? 0.0024,
      opacity: options.opacity ?? 0.45,
      ...options,
    })
  }

  override getType(): string {
    return 'bad_mental'
  }
}

export default BadMental


