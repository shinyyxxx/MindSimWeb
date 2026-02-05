import BadMental from './BadMental'
import type { MentalBaseOptions } from '../AbstractMental'

/**
 * Unwholesome mental factor: Conceit (Mana)
 */
export class ConceitMental extends BadMental {
  constructor(options: MentalBaseOptions = {}) {
    super({
      name: options.name ?? 'Conceit',
      detail: options.detail ?? 'Measuring / comparing; inflated sense of self',
      color: options.color ?? '#fb7185',
      opacity: options.opacity ?? 0.5,
      motionSpeed: options.motionSpeed ?? 0,
      ...options,
    })
  }

  override getType(): string {
    return 'conceit_mental'
  }
}

export default ConceitMental


