import GoodMental from './GoodMental'
import type { MentalBaseOptions } from '../AbstractMental'

/**
 * Common beautiful mental factor: Tranquility of consciousness (Cittapassaddhi)
 */
export class TranquilityMindMental extends GoodMental {
  constructor(options: MentalBaseOptions = {}) {
    super({
      name: options.name ?? 'Tranquility (Mind)',
      detail: options.detail ?? 'Cittapassaddhi: calming of consciousness (citta)',
      motionSpeed: options.motionSpeed ?? 0,
      ...options,
    })
  }

  override getType(): string {
    return 'tranquility_mind_mental'
  }
}

export default TranquilityMindMental

