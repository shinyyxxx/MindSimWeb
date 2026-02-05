import BadMental from './BadMental'
import type { MentalBaseOptions } from '../AbstractMental'

/**
 * Unwholesome mental factor: Delusion (Moha)
 */
export class DelusionMental extends BadMental {
  constructor(options: MentalBaseOptions = {}) {
    super({
      name: options.name ?? 'Delusion',
      detail: options.detail ?? 'Confusion / not-knowing; obscures clear understanding',
      color: options.color ?? '#f43f5e',
      opacity: options.opacity ?? 0.5,
      motionSpeed: options.motionSpeed ?? 0,
      ...options,
    })
  }

  override getType(): string {
    return 'delusion_mental'
  }
}

export default DelusionMental


