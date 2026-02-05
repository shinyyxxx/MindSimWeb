import BadMental from './BadMental'
import type { MentalBaseOptions } from '../AbstractMental'

/**
 * Unwholesome mental factor: Torpor (Middha)
 */
export class TorporMental extends BadMental {
  constructor(options: MentalBaseOptions = {}) {
    super({
      name: options.name ?? 'Torpor',
      detail: options.detail ?? 'Dullness / heaviness; lack of alertness',
      color: options.color ?? '#f97316',
      opacity: options.opacity ?? 0.5,
      motionSpeed: options.motionSpeed ?? 0,
      ...options,
    })
  }

  override getType(): string {
    return 'torpor_mental'
  }
}

export default TorporMental


