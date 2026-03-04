import GoodMental from './GoodMental'
import type { MentalBaseOptions } from '../AbstractMental'

/**
 * Common beautiful mental factor: Moral shame (Hiri)
 */
export class MoralShameMental extends GoodMental {
  constructor(options: MentalBaseOptions = {}) {
    super({
      name: options.name ?? 'Moral Shame (Hiri)',
      detail: options.detail ?? 'Conscience: inner sense of shame at wrongdoing',
      motionSpeed: options.motionSpeed ?? 0,
      ...options,
    })
  }

  override getType(): string {
    return 'moral_shame_mental'
  }
}

export default MoralShameMental

