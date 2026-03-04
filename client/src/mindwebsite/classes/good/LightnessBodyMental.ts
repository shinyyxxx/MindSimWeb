import GoodMental from './GoodMental'
import type { MentalBaseOptions } from '../AbstractMental'

/**
 * Common beautiful mental factor: Lightness of mental body (Kāyalahutā)
 */
export class LightnessBodyMental extends GoodMental {
  constructor(options: MentalBaseOptions = {}) {
    super({
      name: options.name ?? 'Lightness (Mental Body)',
      detail: options.detail ?? 'Kāyalahutā: lightness of associated mental factors',
      motionSpeed: options.motionSpeed ?? 0,
      ...options,
    })
  }

  override getType(): string {
    return 'lightness_body_mental'
  }
}

export default LightnessBodyMental

