import UniversalMental from './UniversalMental'
import type { MentalBaseOptions } from '../AbstractMental'

/**
 * Universal mental factor: Intention (Cetana)
 */
export class IntentionMental extends UniversalMental {
  constructor(options: MentalBaseOptions = {}) {
    super({
      name: options.name ?? 'Intention',
      detail: options.detail ?? 'Directs mental activity and is the force behind actions and karma.',
      color: options.color ?? '#f38181',
      opacity: options.opacity ?? 0.55,
      motionSpeed: options.motionSpeed ?? 0,
      ...options,
    })
  }

  override getType(): string {
    return 'intention_mental'
  }
}

export default IntentionMental


