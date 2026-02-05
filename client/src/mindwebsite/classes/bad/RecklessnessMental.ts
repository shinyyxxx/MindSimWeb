import BadMental from './BadMental'
import type { MentalBaseOptions } from '../AbstractMental'

/**
 * Unwholesome mental factor: Recklessness (Anottappa)
 * Lack of dread of wrongdoing / consequences.
 */
export class RecklessnessMental extends BadMental {
  constructor(options: MentalBaseOptions = {}) {
    super({
      name: options.name ?? 'Recklessness',
      detail: options.detail ?? 'Lack of moral fear; disregard for consequences',
      color: options.color ?? '#fb7185',
      opacity: options.opacity ?? 0.5,
      motionSpeed: options.motionSpeed ?? 0,
      ...options,
    })
  }

  override getType(): string {
    return 'recklessness_mental'
  }
}

export default RecklessnessMental


