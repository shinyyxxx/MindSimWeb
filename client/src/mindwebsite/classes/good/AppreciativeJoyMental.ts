import GoodMental from './GoodMental'
import type { MentalBaseOptions } from '../AbstractMental'
import partyEmojiModel from '../../../assets/emoji/party_emoji.glb?url'

/**
 * Wholesome mental factor: Appreciative Joy (Muditā)
 */
export class AppreciativeJoyMental extends GoodMental {
  constructor(options: MentalBaseOptions = {}) {
    super({
      name: options.name ?? 'Appreciative Joy (Muditā)',
      detail: options.detail ?? 'Illimitable mental factor (appamaññā)',
      motionSpeed: options.motionSpeed ?? 0,
      ...options,
      // Appreciative Joy has its own model; otherwise uses GoodMental default.
      modelPath: options.modelPath ?? partyEmojiModel,
      modelTargetWorldSize: options.modelTargetWorldSize ?? 0.006,
      modelOffset: options.modelOffset ?? { x: 0, y: -0.65, z: 0 },
    })
  }

  override getType(): string {
    return 'appreciative_joy_mental'
  }
}

export default AppreciativeJoyMental

