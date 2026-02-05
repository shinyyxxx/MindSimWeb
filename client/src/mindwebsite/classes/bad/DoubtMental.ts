import BadMental from './BadMental'
import type { MentalBaseOptions } from '../AbstractMental'

/**
 * Unwholesome mental factor: Doubt (Vicikiccha)
 */
export class DoubtMental extends BadMental {
  constructor(options: MentalBaseOptions = {}) {
    super({
      name: options.name ?? 'Doubt',
      detail: options.detail ?? 'Skeptical wavering that blocks commitment and clarity',
      color: options.color ?? '#f97316',
      opacity: options.opacity ?? 0.5,
      motionSpeed: options.motionSpeed ?? 0,
      ...options,
    })
  }

  override getType(): string {
    return 'doubt_mental'
  }
}

export default DoubtMental


