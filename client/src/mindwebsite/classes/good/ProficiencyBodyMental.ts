import GoodMental from './GoodMental'
import type { MentalBaseOptions } from '../AbstractMental'
import nerdEmojiModel from '../../../assets/emoji/nerd_emoji.glb?url'

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
      // Proficiency (body) shares the same model as Proficiency (mind).
      modelPath: options.modelPath ?? nerdEmojiModel,
      modelTargetWorldSize: options.modelTargetWorldSize ?? 6.506,
      modelOffset: options.modelOffset ?? { x: 0, y: -0.65, z: 0 },
    })
  }

  override getType(): string {
    return 'proficiency_body_mental'
  }
}

export default ProficiencyBodyMental

