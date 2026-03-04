import GoodMental from './GoodMental'
import type { MentalBaseOptions } from '../AbstractMental'

/**
 * Common beautiful mental factor: Rectitude of mental body (Kāyujukatā)
 */
export class RectitudeBodyMental extends GoodMental {
  constructor(options: MentalBaseOptions = {}) {
    super({
      name: options.name ?? 'Rectitude (Mental Body)',
      detail: options.detail ?? 'Kāyujukatā: straightness/uprightness of associated mental factors',
      motionSpeed: options.motionSpeed ?? 0,
      ...options,
    })
  }

  override getType(): string {
    return 'rectitude_body_mental'
  }
}

export default RectitudeBodyMental

