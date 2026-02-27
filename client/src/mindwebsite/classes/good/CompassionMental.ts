import GoodMental from './GoodMental'
import type { MentalBaseOptions } from '../AbstractMental'

/**
 * Wholesome mental factor: Compassion (Karuṇā)
 */
export class CompassionMental extends GoodMental {
  constructor(options: MentalBaseOptions = {}) {
    super({
      name: options.name ?? 'Compassion (Karuṇā)',
      detail: options.detail ?? 'Illimitable mental factor (appamaññā)',
      motionSpeed: options.motionSpeed ?? 0,
      ...options,
    })
  }

  override getType(): string {
    return 'compassion_mental'
  }
}

export default CompassionMental

