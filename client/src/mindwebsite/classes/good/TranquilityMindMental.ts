import GoodMental from './GoodMental'
import type { MentalBaseOptions } from '../AbstractMental'
import calmEmojiModel from '../../../assets/emoji/calm_emoji.glb?url'

/**
 * Common beautiful mental factor: Tranquility of consciousness (Cittapassaddhi)
 */
export class TranquilityMindMental extends GoodMental {
  constructor(options: MentalBaseOptions = {}) {
    super({
      name: options.name ?? 'Tranquility (Mind)',
      detail: options.detail ?? 'Cittapassaddhi: calming of consciousness (citta)',
      motionSpeed: options.motionSpeed ?? 0,
      ...options,
      // Tranquility (mind) has its own model; keep same framing as other featured mentals.
      modelPath: options.modelPath ?? calmEmojiModel,
      modelTargetWorldSize: options.modelTargetWorldSize ?? 6.506,
      modelOffset: options.modelOffset ?? { x: 0, y: -0.70, z: 0 },
    })
  }

  override getType(): string {
    return 'tranquility_mind_mental'
  }
}

export default TranquilityMindMental

