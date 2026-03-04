import NeutralMental from './NeutralMental'
import type { MentalBaseOptions } from '../AbstractMental'

/**
 * Universal mental factor: Life faculty / psychic life (Jīvitindriya)
 */
export class LifeFacultyMental extends NeutralMental {
  constructor(options: MentalBaseOptions = {}) {
    super({
      name: options.name ?? 'Life Faculty',
      detail:
        options.detail ??
        'Life faculty (jīvitindriya): the vital force sustaining associated mental factors',
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

