import GoodMental from './GoodMental'
import type { MentalBaseOptions } from '../AbstractMental'
import laughTearEmojiModel from '../../../assets/emoji/laughTear_emoji.glb?url'

/**
 * Common beautiful mental factor: Lightness of consciousness (Cittalahutā)
 */
export class LightnessMindMental extends GoodMental {
  constructor(options: MentalBaseOptions = {}) {
    super({
      name: options.name ?? 'Lightness (Mind)',
      detail: options.detail ?? 'Cittalahutā: lightness of consciousness (citta)',
      motionSpeed: options.motionSpeed ?? 0,
      ...options,
      // Lightness (mind) has its own model; keep same framing as other featured mentals.
      modelPath: options.modelPath ?? laughTearEmojiModel,
      modelTargetWorldSize: options.modelTargetWorldSize ?? 6.506,
      modelOffset: options.modelOffset ?? { x: 0, y: -0.65, z: 0 },
    })
  }

  override getType(): string {
    return 'lightness_mind_mental'
  }
}

export default LightnessMindMental

