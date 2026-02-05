import BadMental from './BadMental'
import type { MentalBaseOptions } from '../AbstractMental'

/**
 * Unwholesome mental factor: Sloth (Thina)
 */
export class SlothMental extends BadMental {
  constructor(options: MentalBaseOptions = {}) {
    super({
      name: options.name ?? 'Sloth',
      detail: options.detail ?? 'Mental sluggishness; lack of initiative',
      color: options.color ?? '#f97316',
      opacity: options.opacity ?? 0.5,
      motionSpeed: options.motionSpeed ?? 0,
      ...options,
    })
  }

  override getType(): string {
    return 'sloth_mental'
  }
}

export default SlothMental


