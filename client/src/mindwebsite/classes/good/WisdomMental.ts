import GoodMental from './GoodMental'
import type { MentalBaseOptions } from '../AbstractMental'
import nerdEmojiModel from '../../../assets/emoji/nerd_emoji.glb?url'

/**
 * Wholesome mental factor: Wisdom (Paññā)
 */
export class WisdomMental extends GoodMental {
  constructor(options: MentalBaseOptions = {}) {
    super({
      name: options.name ?? 'Wisdom (Paññā)',
      detail: options.detail ?? 'Wisdom mental factor',
      motionSpeed: options.motionSpeed ?? 0,
      ...options,
      // Wisdom has its own model; keep same framing as other featured mentals.
      modelPath: options.modelPath ?? nerdEmojiModel,
      modelTargetWorldSize: options.modelTargetWorldSize ?? 6.506,
      modelOffset: options.modelOffset ?? { x: 0, y: -0.65, z: 0 },
    })
  }

  override getType(): string {
    return 'wisdom_mental'
  }
}

export default WisdomMental

