import NeutralMental from './NeutralMental'
import type { MentalBaseOptions } from '../AbstractMental'

/**
 * Base class for the 7 universal cetasikas (sabbacittasadharana)
 * that must be present in every citta.
 */
export class UniversalMental extends NeutralMental {
  constructor(options: MentalBaseOptions = {}) {
    super({
      motionSpeed: options.motionSpeed ?? 0,
      opacity: options.opacity ?? 0.55,
      ...options,
    })
  }

  override getType(): string {
    return 'universal_mental'
  }
}

export default UniversalMental
