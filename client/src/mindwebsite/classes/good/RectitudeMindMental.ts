import GoodMental from './GoodMental'
import type { MentalBaseOptions } from '../AbstractMental'
import determineEmojiModel from '../../../assets/emoji/determine_emoji.glb?url'

/**
 * Common beautiful mental factor: Rectitude of consciousness (Cittujukatā)
 */
export class RectitudeMindMental extends GoodMental {
  constructor(options: MentalBaseOptions = {}) {
    super({
      name: options.name ?? 'Rectitude (Mind)',
      detail: options.detail ?? 'Cittujukatā: straightness/uprightness of consciousness (citta)',
      motionSpeed: options.motionSpeed ?? 0,
      ...options,
      // Rectitude (mind) has its own model.
      modelPath: options.modelPath ?? determineEmojiModel,
      modelTargetWorldSize: options.modelTargetWorldSize ?? 5.500,
      modelOffset: options.modelOffset ?? { x: 0, y: -0.55, z: -0.1 },
    })
  }

  override getType(): string {
    return 'rectitude_mind_mental'
  }
}

export default RectitudeMindMental

