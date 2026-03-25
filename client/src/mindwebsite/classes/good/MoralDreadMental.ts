import GoodMental from './GoodMental'
import type { MentalBaseOptions } from '../AbstractMental'
import screamFearEmojiModel from '../../../assets/emoji/screamFear_emoji.glb?url'

/**
 * Common beautiful mental factor: Moral dread / fear of wrongdoing (Ottappa)
 */
export class MoralDreadMental extends GoodMental {
  constructor(options: MentalBaseOptions = {}) {
    super({
      name: options.name ?? 'Moral Dread (Ottappa)',
      detail: options.detail ?? 'Concern for consequences: reluctance to do wrong out of wise fear',
      motionSpeed: options.motionSpeed ?? 0,
      ...options,
      // Moral Dread has its own model; keep same framing as other featured mentals.
      modelPath: options.modelPath ?? screamFearEmojiModel,
      modelTargetWorldSize: options.modelTargetWorldSize ?? 6.506,
      modelOffset: options.modelOffset ?? { x: 0, y: -0.65, z: 0 },
    })
  }

  override getType(): string {
    return 'moral_dread_mental'
  }
}

export default MoralDreadMental

