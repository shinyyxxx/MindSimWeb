import BadMental from './BadMental'
import type { MentalBaseOptions } from '../AbstractMental'

/**
 * Unwholesome mental factor: Shamelessness (Ahirika)
 * Lack of conscience / moral shame.
 */
export class ShamelessnessMental extends BadMental {
  constructor(options: MentalBaseOptions = {}) {
    super({
      name: options.name ?? 'Shamelessness',
      detail: options.detail ?? 'Lack of conscience; no sense of moral shame',
      color: options.color ?? '#fb7185',
      opacity: options.opacity ?? 0.5,
      motionSpeed: options.motionSpeed ?? 0,
      ...options,
    })
  }

  override getType(): string {
    return 'shamelessness_mental'
  }
}

export default ShamelessnessMental


