import NeutralMental from './NeutralMental'
import type { MentalBaseOptions } from '../AbstractMental'

/**
 * Particular mental factor: Initial Application (Vitakka)
 */
export class InitialApplicationMental extends NeutralMental {
  constructor(options: MentalBaseOptions = {}) {
    super({
      name: options.name ?? 'Initial Application',
      detail: options.detail ?? 'Vitakka: directing the mind toward an object (initial application)',
      color: options.color ?? '#94a3b8',
      opacity: options.opacity ?? 0.55,
      motionSpeed: options.motionSpeed ?? 0,
      ...options,
    })
  }

  override getType(): string {
    return 'initial_application_mental'
  }
}

export default InitialApplicationMental

