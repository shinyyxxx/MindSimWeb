import GoodMental from './GoodMental'
import type { MentalBaseOptions } from '../AbstractMental'

/**
 * Common beautiful mental factor: Mindfulness (Sati)
 */
export class MindfulnessMental extends GoodMental {
  constructor(options: MentalBaseOptions = {}) {
    super({
      name: options.name ?? 'Mindfulness (Sati)',
      detail: options.detail ?? 'Non-forgetfulness: keeping the object in mind with clear presence',
      motionSpeed: options.motionSpeed ?? 0,
      ...options,
    })
  }

  override getType(): string {
    return 'mindfulness_mental'
  }
}

export default MindfulnessMental

