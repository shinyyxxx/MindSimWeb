import GoodMental from './GoodMental'
import type { MentalBaseOptions } from '../AbstractMental'

/**
 * Common beautiful mental factor: Proficiency of mental body (Kāyapāguññatā)
 */
export class ProficiencyBodyMental extends GoodMental {
  constructor(options: MentalBaseOptions = {}) {
    super({
      name: options.name ?? 'Proficiency (Mental Body)',
      detail: options.detail ?? 'Kāyapāguññatā: skillfulness/proficiency of associated mental factors',
      motionSpeed: options.motionSpeed ?? 0,
      ...options,
    })
  }

  override getType(): string {
    return 'proficiency_body_mental'
  }
}

export default ProficiencyBodyMental

