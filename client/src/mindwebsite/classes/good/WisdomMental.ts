import GoodMental from './GoodMental'
import type { MentalBaseOptions } from '../AbstractMental'

/**
 * Wholesome mental factor: Wisdom (Paññā)
 */
export class WisdomMental extends GoodMental {
  constructor(options: MentalBaseOptions = {}) {
    super({
      name: options.name ?? 'Wisdom (Paññā)',
      detail: options.detail ?? 'Wisdom mental factor',
      motionSpeed: options.motionSpeed ?? 0,
      ...options,
    })
  }

  override getType(): string {
    return 'wisdom_mental'
  }
}

export default WisdomMental

