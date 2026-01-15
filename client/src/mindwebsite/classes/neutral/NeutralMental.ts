import Mental from '../Mental'
import type { MentalBaseOptions } from '../AbstractMental'

/**
 * A neutral mental sphere with a balanced appearance and default motion.
 */
export class NeutralMental extends Mental {
  constructor(options: MentalBaseOptions = {}) {
    super({
      color: '#a1a1aa',
      motionSpeed: options.motionSpeed ?? 0.002,
      opacity: options.opacity ?? 0.5,
      ...options,
    })
  }

  override getType(): string {
    return 'neutral_mental'
  }
}

export default NeutralMental


