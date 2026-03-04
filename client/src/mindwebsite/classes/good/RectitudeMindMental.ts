import GoodMental from './GoodMental'
import type { MentalBaseOptions } from '../AbstractMental'

/**
 * Common beautiful mental factor: Rectitude of consciousness (Cittujukatā)
 */
export class RectitudeMindMental extends GoodMental {
  constructor(options: MentalBaseOptions = {}) {
    super({
      name: options.name ?? 'Rectitude (Mind)',
      detail: options.detail ?? 'Cittujukatā: straightness/uprightness of consciousness (citta)',
      motionSpeed: options.motionSpeed ?? 0,
      ...options,
    })
  }

  override getType(): string {
    return 'rectitude_mind_mental'
  }
}

export default RectitudeMindMental

