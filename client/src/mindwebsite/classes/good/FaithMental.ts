import GoodMental from './GoodMental'
import type { MentalBaseOptions } from '../AbstractMental'

/**
 * Common beautiful mental factor: Faith (Saddhā)
 */
export class FaithMental extends GoodMental {
  constructor(options: MentalBaseOptions = {}) {
    super({
      name: options.name ?? 'Faith (Saddhā)',
      detail: options.detail ?? 'Confidence/trust that clarifies and steadies the mind',
      motionSpeed: options.motionSpeed ?? 0,
      ...options,
    })
  }

  override getType(): string {
    return 'faith_mental'
  }
}

export default FaithMental

