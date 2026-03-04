import GoodMental from './GoodMental'
import type { MentalBaseOptions } from '../AbstractMental'

/**
 * Common beautiful mental factor: Proficiency of consciousness (Cittapāguññatā)
 */
export class ProficiencyMindMental extends GoodMental {
  constructor(options: MentalBaseOptions = {}) {
    super({
      name: options.name ?? 'Proficiency (Mind)',
      detail: options.detail ?? 'Cittapāguññatā: skillfulness/proficiency of consciousness (citta)',
      motionSpeed: options.motionSpeed ?? 0,
      ...options,
    })
  }

  override getType(): string {
    return 'proficiency_mind_mental'
  }
}

export default ProficiencyMindMental

