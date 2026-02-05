import BadMental from './BadMental'
import type { MentalBaseOptions } from '../AbstractMental'

/**
 * Unwholesome mental factor: Envy (Issa)
 */
export class EnvyMental extends BadMental {
  constructor(options: MentalBaseOptions = {}) {
    super({
      name: options.name ?? 'Envy',
      detail: options.detail ?? "Resentment at others' success or happiness",
      color: options.color ?? '#f59e0b',
      opacity: options.opacity ?? 0.5,
      motionSpeed: options.motionSpeed ?? 0,
      ...options,
    })
  }

  override getType(): string {
    return 'envy_mental'
  }
}

export default EnvyMental


