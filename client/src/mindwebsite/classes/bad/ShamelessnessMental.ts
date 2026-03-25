import BadMental from './BadMental'
import type { MentalBaseOptions } from '../AbstractMental'
import smileDevilEmojiModel from '../../../assets/emoji/smileDevil_emoji.glb?url'

/**
 * Unwholesome mental factor: Shamelessness (Ahirika)
 * Lack of conscience / moral shame.
 */
export class ShamelessnessMental extends BadMental {
  constructor(options: MentalBaseOptions = {}) {
    super({
      name: options.name ?? 'Shamelessness',
      detail: options.detail ?? 'Lack of conscience; no sense of moral shame',
      color: options.color ?? '#fb7185',
      opacity: options.opacity ?? 0.5,
      motionSpeed: options.motionSpeed ?? 0,
      ...options,
      // Shamelessness has its own model; keep same framing as other featured mentals.
      modelPath: options.modelPath ?? smileDevilEmojiModel,
      modelTargetWorldSize: options.modelTargetWorldSize ?? 6.506,
      modelOffset: options.modelOffset ?? { x: 0, y: -0.80, z: 0 },
    })
  }

  override getType(): string {
    return 'shamelessness_mental'
  }
}

export default ShamelessnessMental


