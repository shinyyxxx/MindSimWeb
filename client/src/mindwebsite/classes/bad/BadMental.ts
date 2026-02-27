import Mental from '../Mental'
import type { MentalBaseOptions } from '../AbstractMental'
import angerEmojiModel from '../../../assets/emoji/anger_emoji.glb?url'

/**
 * A "bad" mental sphere with a warning color and slightly more energetic motion.
 */
export class BadMental extends Mental {
  constructor(options: MentalBaseOptions = {}) {
    super({
      color: '#ef4444',
      motionSpeed: options.motionSpeed ?? 0.0024,
      opacity: options.opacity ?? 0.45,
      ...options,
      // Default placeholder for all "bad" mental factors.
      modelPath: options.modelPath ?? angerEmojiModel,
      modelTargetWorldSize: options.modelTargetWorldSize ?? 0.08,
      modelOffset: options.modelOffset ?? { x: 0, y: -0.02, z: 0 },
    })
  }

  override getType(): string {
    return 'bad_mental'
  }
}

export default BadMental


