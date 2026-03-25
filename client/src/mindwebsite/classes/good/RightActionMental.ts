import GoodMental from './GoodMental'
import type { MentalBaseOptions } from '../AbstractMental'
import mediMaskEmojiModel from '../../../assets/emoji/mediMask_emoji.glb?url'

/**
 * Wholesome mental factor: Right Action (Sammā-kammanta)
 */
export class RightActionMental extends GoodMental {
  constructor(options: MentalBaseOptions = {}) {
    super({
      name: options.name ?? 'Right Action (Sammā-kammanta)',
      detail: options.detail ?? 'Abstinence from wrong action',
      motionSpeed: options.motionSpeed ?? 0,
      ...options,
      // Right Action has its own model; keep same framing as other featured mentals.
      modelPath: options.modelPath ?? mediMaskEmojiModel,
      modelTargetWorldSize: options.modelTargetWorldSize ?? 6.506,
      modelOffset: options.modelOffset ?? { x: 0, y: -0.70, z: 0 },
    })
  }

  override getType(): string {
    return 'right_action_mental'
  }
}

export default RightActionMental

