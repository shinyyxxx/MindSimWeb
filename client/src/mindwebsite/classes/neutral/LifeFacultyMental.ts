import NeutralMental from './NeutralMental'
import type { MentalBaseOptions } from '../AbstractMental'

/**
 * Universal mental factor: Life faculty / psychic life (Jīvitindriya)
 */
export class LifeFacultyMental extends NeutralMental {
  constructor(options: MentalBaseOptions = {}) {
    super({
      name: options.name ?? 'Life Faculty',
      detail: options.detail ?? 'Sustains and maintains the life of mental states during each moment.',
      color: options.color ?? '#a78bfa',
      opacity: options.opacity ?? 0.55,
      motionSpeed: options.motionSpeed ?? 0,
      ...options,
    })
  }

  override getType(): string {
    return 'life_faculty_mental'
  }
}

export default LifeFacultyMental

