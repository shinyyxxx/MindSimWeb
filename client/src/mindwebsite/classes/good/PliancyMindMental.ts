import GoodMental from './GoodMental'
import type { MentalBaseOptions } from '../AbstractMental'
import looseTongueEmojiModel from '../../../assets/emoji/looseTongue_emoji.glb?url'

/**
 * Common beautiful mental factor: Pliancy of consciousness (Cittamudutā)
 */
export class PliancyMindMental extends GoodMental {
  constructor(options: MentalBaseOptions = {}) {
    super({
      name: options.name ?? 'Pliancy (Mind)',
      detail: options.detail ?? 'Cittamudutā: softness/pliancy of consciousness (citta)',
      motionSpeed: options.motionSpeed ?? 0,
      ...options,
      // Pliancy (mind) has its own model; keep same framing as other featured mentals.
      modelPath: options.modelPath ?? looseTongueEmojiModel,
      modelTargetWorldSize: options.modelTargetWorldSize ?? 6.506,
      modelOffset: options.modelOffset ?? { x: 0, y: -0.65, z: 0 },
    })
  }

  override getType(): string {
    return 'pliancy_mind_mental'
  }
}

export default PliancyMindMental

