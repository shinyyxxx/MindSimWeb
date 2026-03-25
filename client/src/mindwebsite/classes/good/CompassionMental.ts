import GoodMental from './GoodMental'
import type { MentalBaseOptions } from '../AbstractMental'
import singleTearEmojiModel from '../../../assets/emoji/sadSingleTear_emoji.glb?url'

/**
 * Wholesome mental factor: Compassion (Karuṇā)
 */
export class CompassionMental extends GoodMental {
  constructor(options: MentalBaseOptions = {}) {
    super({
      name: options.name ?? 'Compassion (Karuṇā)',
      detail: options.detail ?? 'Illimitable mental factor (appamaññā)',
      motionSpeed: options.motionSpeed ?? 0,
      ...options,
      // Compassion has its own model; keep same framing as other featured mentals.
      modelPath: options.modelPath ?? singleTearEmojiModel,
      modelTargetWorldSize: options.modelTargetWorldSize ?? 6.506,
      modelOffset: options.modelOffset ?? { x: 0, y: -0.65, z: 0 },
    })
  }

  override getType(): string {
    return 'compassion_mental'
  }
}

export default CompassionMental

