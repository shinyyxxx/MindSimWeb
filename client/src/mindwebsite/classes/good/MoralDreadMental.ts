import GoodMental from './GoodMental'
import type { MentalBaseOptions } from '../AbstractMental'

/**
 * Common beautiful mental factor: Moral dread / fear of wrongdoing (Ottappa)
 */
export class MoralDreadMental extends GoodMental {
  constructor(options: MentalBaseOptions = {}) {
    super({
      name: options.name ?? 'Moral Dread (Ottappa)',
      detail: options.detail ?? 'Concern for consequences: reluctance to do wrong out of wise fear',
      motionSpeed: options.motionSpeed ?? 0,
      ...options,
    })
  }

  override getType(): string {
    return 'moral_dread_mental'
  }
}

export default MoralDreadMental

