import Mental from '../Mental'
import type { MentalBaseOptions } from '../AbstractMental'

/**
 * A "good" mental sphere with a calm default color and slightly slower motion.
 */
export class GoodMental extends Mental {
  constructor(options: MentalBaseOptions = {}) {
    super({
      color: '#22c55e',
      motionSpeed: options.motionSpeed ?? 0.0018,
      opacity: options.opacity ?? 0.5,
      ...options,
    })
  }

  override getType(): string {
    return 'good_mental'
  }
}

export default GoodMental


