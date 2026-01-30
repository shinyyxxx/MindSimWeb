import NeutralMental from './NeutralMental'
import type { MentalBaseOptions } from '../AbstractMental'

/**
 * Universal mental factor: Consciousness (Vinnana)
 */
export class ConsciousnessMental extends NeutralMental {
  constructor(options: MentalBaseOptions = {}) {
    super({
      name: options.name ?? 'Consciousness',
      detail: options.detail ?? 'Knowing / consciousness of an object',
      color: options.color ?? '#ffd93d',
      opacity: options.opacity ?? 0.55,
      motionSpeed: options.motionSpeed ?? 0,
      ...options,
    })
  }

  override getType(): string {
    return 'consciousness_mental'
  }
}

export default ConsciousnessMental


