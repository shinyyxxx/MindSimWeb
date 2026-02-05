import BadMental from './BadMental'
import type { MentalBaseOptions } from '../AbstractMental'

/**
 * Unwholesome mental factor: Hatred (Dosa)
 */
export class HatredMental extends BadMental {
  constructor(options: MentalBaseOptions = {}) {
    super({
      name: options.name ?? 'Hatred',
      detail: options.detail ?? 'Aversion / ill-will; pushing away an object',
      color: options.color ?? '#ef4444',
      opacity: options.opacity ?? 0.5,
      motionSpeed: options.motionSpeed ?? 0,
      ...options,
    })
  }

  override getType(): string {
    return 'hatred_mental'
  }
}

export default HatredMental


