import GoodMental from './GoodMental'
import type { MentalBaseOptions } from '../AbstractMental'

/**
 * Common beautiful mental factor: Tranquility of mental body (Kāyapassaddhi)
 */
export class TranquilityBodyMental extends GoodMental {
  constructor(options: MentalBaseOptions = {}) {
    super({
      name: options.name ?? 'Tranquility (Mental Body)',
      detail: options.detail ?? 'Kāyapassaddhi: calming of the associated mental factors (the “mental body”)',
      motionSpeed: options.motionSpeed ?? 0,
      ...options,
    })
  }

  override getType(): string {
    return 'tranquility_body_mental'
  }
}

export default TranquilityBodyMental

