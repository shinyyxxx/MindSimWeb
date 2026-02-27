import GoodMental from './GoodMental'
import type { MentalBaseOptions } from '../AbstractMental'

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
    })
  }

  override getType(): string {
    return 'appreciative_joy_mental'
  }
}

export default AppreciativeJoyMental

