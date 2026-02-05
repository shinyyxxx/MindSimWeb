import BadMental from './BadMental'
import type { MentalBaseOptions } from '../AbstractMental'

/**
 * Unwholesome mental factor: Greed (Lobha)
 */
export class GreedMental extends BadMental {
  constructor(options: MentalBaseOptions = {}) {
    super({
      name: options.name ?? 'Greed',
      detail: options.detail ?? 'Craving / attachment toward an object',
      color: options.color ?? '#fb923c',
      opacity: options.opacity ?? 0.5,
      motionSpeed: options.motionSpeed ?? 0,
      ...options,
    })
  }

  override getType(): string {
    return 'greed_mental'
  }
}

export default GreedMental


