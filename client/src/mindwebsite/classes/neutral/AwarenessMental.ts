import NeutralMental from './NeutralMental'
import type { MentalBaseOptions } from '../AbstractMental'

/**
 * Universal mental factor: Awareness
 */
export class AwarenessMental extends NeutralMental {
  constructor(options: MentalBaseOptions = {}) {
    super({
      name: options.name ?? 'Awareness',
      detail: options.detail ?? 'Awareness / mindfulness-like knowing',
      color: options.color ?? '#6bcf7f',
      opacity: options.opacity ?? 0.55,
      motionSpeed: options.motionSpeed ?? 0,
      ...options,
    })
  }

  override getType(): string {
    return 'awareness_mental'
  }
}

export default AwarenessMental


