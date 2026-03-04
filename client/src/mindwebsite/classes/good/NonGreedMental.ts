import GoodMental from './GoodMental'
import type { MentalBaseOptions } from '../AbstractMental'

/**
 * Common beautiful mental factor: Non-greed (Alobha)
 */
export class NonGreedMental extends GoodMental {
  constructor(options: MentalBaseOptions = {}) {
    super({
      name: options.name ?? 'Non-greed (Alobha)',
      detail: options.detail ?? 'Detachment: freedom from clinging and possessiveness',
      motionSpeed: options.motionSpeed ?? 0,
      ...options,
    })
  }

  override getType(): string {
    return 'non_greed_mental'
  }
}

export default NonGreedMental

