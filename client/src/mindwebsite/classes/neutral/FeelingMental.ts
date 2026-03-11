import NeutralMental from './NeutralMental'
import type { MentalBaseOptions } from '../AbstractMental'
import smileHeartModel from '../../../assets/emoji/smileHeart_emoji.glb?url'

/**
 * Universal mental factor: Feeling (Vedana)
 */
export class FeelingMental extends NeutralMental {
  constructor(options: MentalBaseOptions = {}) {
    super({
      name: options.name ?? 'Feeling',
      detail: options.detail ?? 'Feeling tone: pleasant, unpleasant, or neutral',
      color: options.color ?? '#4ecdc4',
      opacity: options.opacity ?? 0.55,
      motionSpeed: options.motionSpeed ?? 0,
      ...options,
      // Feeling has its own model; same size and offset as Appreciative Joy.
      modelPath: options.modelPath ?? smileHeartModel,
      modelTargetWorldSize: options.modelTargetWorldSize ?? 6.506,
      modelOffset: options.modelOffset ?? { x: 0, y: -0.65, z: 0 },
    })
  }

  override getType(): string {
    return 'feeling_mental'
  }
}

export default FeelingMental


