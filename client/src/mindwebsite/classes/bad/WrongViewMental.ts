import BadMental from './BadMental'
import type { MentalBaseOptions } from '../AbstractMental'

/**
 * Unwholesome mental factor: Wrong View (Ditthi)
 */
export class WrongViewMental extends BadMental {
  constructor(options: MentalBaseOptions = {}) {
    super({
      name: options.name ?? 'Wrong View',
      detail: options.detail ?? 'Distorted view; clinging to mistaken beliefs as true',
      color: options.color ?? '#fb7185',
      opacity: options.opacity ?? 0.5,
      motionSpeed: options.motionSpeed ?? 0,
      ...options,
    })
  }

  override getType(): string {
    return 'wrong_view_mental'
  }
}

export default WrongViewMental


