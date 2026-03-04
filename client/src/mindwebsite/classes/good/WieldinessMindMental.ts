import GoodMental from './GoodMental'
import type { MentalBaseOptions } from '../AbstractMental'

/**
 * Common beautiful mental factor: Wieldiness of consciousness (Cittakammaññatā)
 */
export class WieldinessMindMental extends GoodMental {
  constructor(options: MentalBaseOptions = {}) {
    super({
      name: options.name ?? 'Wieldiness (Mind)',
      detail: options.detail ?? 'Cittakammaññatā: adaptability/workability of consciousness (citta)',
      motionSpeed: options.motionSpeed ?? 0,
      ...options,
    })
  }

  override getType(): string {
    return 'wieldiness_mind_mental'
  }
}

export default WieldinessMindMental

