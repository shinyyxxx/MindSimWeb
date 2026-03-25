import GoodMental from './GoodMental'
import type { MentalBaseOptions } from '../AbstractMental'
import nerdEmojiModel from '../../../assets/emoji/nerd_emoji.glb?url'

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
      // Proficiency (mind) has its own model; keep same framing as other featured mentals.
      modelPath: options.modelPath ?? nerdEmojiModel,
      modelTargetWorldSize: options.modelTargetWorldSize ?? 6.506,
      modelOffset: options.modelOffset ?? { x: 0, y: -0.65, z: 0 },
    })
  }

  override getType(): string {
    return 'proficiency_mind_mental'
  }
}

export default ProficiencyMindMental

