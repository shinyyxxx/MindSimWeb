import GoodMental from './GoodMental'
import type { MentalBaseOptions } from '../AbstractMental'

/**
 * Wholesome mental factor: Right Livelihood (Sammā-ājīva)
 */
export class RightLivelihoodMental extends GoodMental {
  constructor(options: MentalBaseOptions = {}) {
    super({
      name: options.name ?? 'Right Livelihood (Sammā-ājīva)',
      detail: options.detail ?? 'Abstinence from wrong livelihood',
      motionSpeed: options.motionSpeed ?? 0,
      ...options,
    })
  }

  override getType(): string {
    return 'right_livelihood_mental'
  }
}

export default RightLivelihoodMental

