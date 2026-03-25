import BadMental from './BadMental'
import type { MentalBaseOptions } from '../AbstractMental'
import spiralEmojiModel from '../../../assets/emoji/spiral_emoji.glb?url'

/**
 * Unwholesome mental factor: Delusion (Moha)
 */
export class DelusionMental extends BadMental {
  constructor(options: MentalBaseOptions = {}) {
    super({
      name: options.name ?? 'Delusion',
      detail: options.detail ?? 'Confusion / not-knowing; obscures clear understanding',
      color: options.color ?? '#f43f5e',
      opacity: options.opacity ?? 0.5,
      motionSpeed: options.motionSpeed ?? 0,
      ...options,
      // Delusion has its own model; keep same framing as other featured mentals.
      modelPath: options.modelPath ?? spiralEmojiModel,
      modelTargetWorldSize: options.modelTargetWorldSize ?? 6.506,
      modelOffset: options.modelOffset ?? { x: 0, y: -0.65, z: -0.8 },
    })
  }

  override getType(): string {
    return 'delusion_mental'
  }
}

export default DelusionMental


