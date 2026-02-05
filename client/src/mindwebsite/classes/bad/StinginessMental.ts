import BadMental from './BadMental'
import type { MentalBaseOptions } from '../AbstractMental'

/**
 * Unwholesome mental factor: Stinginess (Macchariya)
 */
export class StinginessMental extends BadMental {
  constructor(options: MentalBaseOptions = {}) {
    super({
      name: options.name ?? 'Stinginess',
      detail: options.detail ?? 'Selfish withholding; fear of sharing or losing',
      color: options.color ?? '#f59e0b',
      opacity: options.opacity ?? 0.5,
      motionSpeed: options.motionSpeed ?? 0,
      ...options,
    })
  }

  override getType(): string {
    return 'stinginess_mental'
  }
}

export default StinginessMental


