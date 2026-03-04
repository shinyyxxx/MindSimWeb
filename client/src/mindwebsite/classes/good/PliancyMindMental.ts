import GoodMental from './GoodMental'
import type { MentalBaseOptions } from '../AbstractMental'

/**
 * Common beautiful mental factor: Pliancy of consciousness (Cittamudutā)
 */
export class PliancyMindMental extends GoodMental {
  constructor(options: MentalBaseOptions = {}) {
    super({
      name: options.name ?? 'Pliancy (Mind)',
      detail: options.detail ?? 'Cittamudutā: softness/pliancy of consciousness (citta)',
      motionSpeed: options.motionSpeed ?? 0,
      ...options,
    })
  }

  override getType(): string {
    return 'pliancy_mind_mental'
  }
}

export default PliancyMindMental

