import GoodMental from './GoodMental'
import type { MentalBaseOptions } from '../AbstractMental'

/**
 * Common beautiful mental factor: Non-hatred (Adosa)
 */
export class NonHatredMental extends GoodMental {
  constructor(options: MentalBaseOptions = {}) {
    super({
      name: options.name ?? 'Non-hatred (Adosa)',
      detail: options.detail ?? 'Goodwill: absence of aversion, enabling kindness and patience',
      motionSpeed: options.motionSpeed ?? 0,
      ...options,
    })
  }

  override getType(): string {
    return 'non_hatred_mental'
  }
}

export default NonHatredMental

