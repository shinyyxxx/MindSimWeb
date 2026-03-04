import NeutralMental from './NeutralMental'
import type { MentalBaseOptions } from '../AbstractMental'

/**
 * Particular mental factor: Decision / Determination (Adhimokkha)
 */
export class DeterminationMental extends NeutralMental {
  constructor(options: MentalBaseOptions = {}) {
    super({
      name: options.name ?? 'Determination',
      detail: options.detail ?? 'Adhimokkha: resolving/deciding firmly on an object or course',
      color: options.color ?? '#f59e0b',
      opacity: options.opacity ?? 0.55,
      motionSpeed: options.motionSpeed ?? 0,
      ...options,
    })
  }

  override getType(): string {
    return 'determination_mental'
  }
}

export default DeterminationMental

