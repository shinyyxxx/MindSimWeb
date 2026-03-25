import GoodMental from './GoodMental'
import type { MentalBaseOptions } from '../AbstractMental'
import confoundedEmojiModel from '../../../assets/emoji/confounded_emoji.glb?url'

/**
 * Common beautiful mental factor: Moral shame (Hiri)
 */
export class MoralShameMental extends GoodMental {
  constructor(options: MentalBaseOptions = {}) {
    super({
      name: options.name ?? 'Moral Shame (Hiri)',
      detail: options.detail ?? 'Conscience: inner sense of shame at wrongdoing',
      motionSpeed: options.motionSpeed ?? 0,
      ...options,
      // Moral Shame has its own model; keep same framing as other featured mentals.
      modelPath: options.modelPath ?? confoundedEmojiModel,
      modelTargetWorldSize: options.modelTargetWorldSize ?? 6.506,
      modelOffset: options.modelOffset ?? { x: 0, y: -0.65, z: 0 },
    })
  }

  override getType(): string {
    return 'moral_shame_mental'
  }
}

export default MoralShameMental

