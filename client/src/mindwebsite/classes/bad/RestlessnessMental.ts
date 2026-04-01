import BadMental from './BadMental'
import type { MentalBaseOptions } from '../AbstractMental'
import explodeHeadEmojiModel from '../../../assets/emoji/explodeHead_emoji.glb?url'

/**
 * Unwholesome mental factor: Restlessness (Uddhacca)
 */
export class RestlessnessMental extends BadMental {
  constructor(options: MentalBaseOptions = {}) {
    super({
      name: options.name ?? 'Restlessness',
      detail: options.detail ?? 'Agitation / mental turbulence; inability to settle',
      color: options.color ?? '#f43f5e',
      opacity: options.opacity ?? 0.5,
      motionSpeed: options.motionSpeed ?? 0,
      ...options,
      // Restlessness has its own model; keep same framing as other featured mentals.
      modelPath: options.modelPath ?? explodeHeadEmojiModel,
      modelTargetWorldSize: options.modelTargetWorldSize ?? 6.506,
      modelOffset: options.modelOffset ?? { x: 0, y: -0.75, z: 0 },
    })
  }

  override getType(): string {
    return 'restlessness_mental'
  }
}

export default RestlessnessMental


