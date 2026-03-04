import GoodMental from './GoodMental'
import type { MentalBaseOptions } from '../AbstractMental'

/**
 * Common beautiful mental factor: Pliancy of mental body (Kāyamudutā)
 */
export class PliancyBodyMental extends GoodMental {
  constructor(options: MentalBaseOptions = {}) {
    super({
      name: options.name ?? 'Pliancy (Mental Body)',
      detail: options.detail ?? 'Kāyamudutā: softness/pliancy of associated mental factors',
      motionSpeed: options.motionSpeed ?? 0,
      ...options,
    })
  }

  override getType(): string {
    return 'pliancy_body_mental'
  }
}

export default PliancyBodyMental

