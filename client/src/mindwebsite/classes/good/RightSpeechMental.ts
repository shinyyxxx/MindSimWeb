import GoodMental from './GoodMental'
import type { MentalBaseOptions } from '../AbstractMental'

/**
 * Wholesome mental factor: Right Speech (Sammā-vācā)
 */
export class RightSpeechMental extends GoodMental {
  constructor(options: MentalBaseOptions = {}) {
    super({
      name: options.name ?? 'Right Speech (Sammā-vācā)',
      detail: options.detail ?? 'Abstinence from wrong speech',
      motionSpeed: options.motionSpeed ?? 0,
      ...options,
    })
  }

  override getType(): string {
    return 'right_speech_mental'
  }
}

export default RightSpeechMental

