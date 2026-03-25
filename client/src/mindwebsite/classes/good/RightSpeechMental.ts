import GoodMental from './GoodMental'
import type { MentalBaseOptions } from '../AbstractMental'
import shushEmojiModel from '../../../assets/emoji/shush_emoji.glb?url'

/**
 * Wholesome mental factor: Right Speech (Sammā-vācā)
 */
export class RightSpeechMental extends GoodMental {
  constructor(options: MentalBaseOptions = {}) {
    super({
      name: options.name ?? 'Right Speech (Sammā-vācā)',
      detail: options.detail ?? 'Abstinence from wrong speech',
      motionSpeed: options.motionSpeed ?? 0,
      ...options,
      // Right Speech has its own model; keep same framing as other featured mentals.
      modelPath: options.modelPath ?? shushEmojiModel,
      modelTargetWorldSize: options.modelTargetWorldSize ?? 5.506,
      modelOffset: options.modelOffset ?? { x: 0, y: -0.55, z: -0.2 },
    })
  }

  override getType(): string {
    return 'right_speech_mental'
  }
}

export default RightSpeechMental

