import BadMental from './BadMental'
import type { MentalBaseOptions } from '../AbstractMental'
import zipMouthEmojiModel from '../../../assets/emoji/zipMouth_emoji.glb?url'

/**
 * Unwholesome mental factor: Stinginess (Macchariya)
 */
export class StinginessMental extends BadMental {
  constructor(options: MentalBaseOptions = {}) {
    super({
      name: options.name ?? 'Stinginess',
      detail: options.detail ?? 'Selfish withholding; fear of sharing or losing',
      color: options.color ?? '#f59e0b',
      opacity: options.opacity ?? 0.5,
      motionSpeed: options.motionSpeed ?? 0,
      ...options,
      // Stinginess has its own model; keep same framing as other featured mentals.
      modelPath: options.modelPath ?? zipMouthEmojiModel,
      modelTargetWorldSize: options.modelTargetWorldSize ?? 6.506,
      modelOffset: options.modelOffset ?? { x: 0, y: -0.65, z: 0 },
    })
  }

  override getType(): string {
    return 'stinginess_mental'
  }
}

export default StinginessMental


