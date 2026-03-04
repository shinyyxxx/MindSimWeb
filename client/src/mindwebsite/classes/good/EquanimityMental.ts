import GoodMental from './GoodMental'
import type { MentalBaseOptions } from '../AbstractMental'

/**
 * Common beautiful mental factor: Equanimity (Tatramajjhattatā)
 */
export class EquanimityMental extends GoodMental {
  constructor(options: MentalBaseOptions = {}) {
    super({
      name: options.name ?? 'Equanimity (Tatramajjhattatā)',
      detail: options.detail ?? 'Even-minded balance toward objects; impartiality',
      motionSpeed: options.motionSpeed ?? 0,
      ...options,
    })
  }

  override getType(): string {
    return 'equanimity_mental'
  }
}

export default EquanimityMental

