import GoodMental from './GoodMental'
import type { MentalBaseOptions } from '../AbstractMental'

/**
 * Common beautiful mental factor: Wieldiness of mental body (Kāyakammaññatā)
 */
export class WieldinessBodyMental extends GoodMental {
  constructor(options: MentalBaseOptions = {}) {
    super({
      name: options.name ?? 'Wieldiness (Mental Body)',
      detail: options.detail ?? 'Kāyakammaññatā: adaptability/workability of associated mental factors',
      motionSpeed: options.motionSpeed ?? 0,
      ...options,
    })
  }

  override getType(): string {
    return 'wieldiness_body_mental'
  }
}

export default WieldinessBodyMental

