import BadMental from './BadMental'
import type { MentalBaseOptions } from '../AbstractMental'

/**
 * Unwholesome mental factor: Restlessness (Uddhacca)
 */
export class RestlessnessMental extends BadMental {
  constructor(options: MentalBaseOptions = {}) {
    super({
      name: options.name ?? 'Restlessness',
      detail: options.detail ?? 'Agitation / mental turbulence; inability to settle',
      color: options.color ?? '#f43f5e',
      opacity: options.opacity ?? 0.5,
      motionSpeed: options.motionSpeed ?? 0,
      ...options,
    })
  }

  override getType(): string {
    return 'restlessness_mental'
  }
}

export default RestlessnessMental


