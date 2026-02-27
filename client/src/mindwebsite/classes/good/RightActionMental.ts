import GoodMental from './GoodMental'
import type { MentalBaseOptions } from '../AbstractMental'

/**
 * Wholesome mental factor: Right Action (Sammā-kammanta)
 */
export class RightActionMental extends GoodMental {
  constructor(options: MentalBaseOptions = {}) {
    super({
      name: options.name ?? 'Right Action (Sammā-kammanta)',
      detail: options.detail ?? 'Abstinence from wrong action',
      motionSpeed: options.motionSpeed ?? 0,
      ...options,
    })
  }

  override getType(): string {
    return 'right_action_mental'
  }
}

export default RightActionMental

