import NeutralMental from './NeutralMental'
import type { MentalBaseOptions } from '../AbstractMental'

/**
 * Universal mental factor: Attention (Manasikara)
 */
export class AttentionMental extends NeutralMental {
  constructor(options: MentalBaseOptions = {}) {
    super({
      name: options.name ?? 'Attention',
      detail: options.detail ?? 'Turns the mind toward an object, making awareness possible.',
      color: options.color ?? '#aa96da',
      opacity: options.opacity ?? 0.55,
      motionSpeed: options.motionSpeed ?? 0,
      ...options,
    })
  }

  override getType(): string {
    return 'attention_mental'
  }
}

export default AttentionMental


