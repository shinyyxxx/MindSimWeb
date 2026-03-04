import GoodMental from './GoodMental'
import type { MentalBaseOptions } from '../AbstractMental'

/**
 * Common beautiful mental factor: Lightness of consciousness (Cittalahutā)
 */
export class LightnessMindMental extends GoodMental {
  constructor(options: MentalBaseOptions = {}) {
    super({
      name: options.name ?? 'Lightness (Mind)',
      detail: options.detail ?? 'Cittalahutā: lightness of consciousness (citta)',
      motionSpeed: options.motionSpeed ?? 0,
      ...options,
    })
  }

  override getType(): string {
    return 'lightness_mind_mental'
  }
}

export default LightnessMindMental

