import NeutralMental from './NeutralMental'
import type { MentalBaseOptions } from '../AbstractMental'

/**
 * Universal mental factor: Concentration / One-pointedness (Ekaggatā)
 */
export class ConcentrationMental extends NeutralMental {
  constructor(options: MentalBaseOptions = {}) {
    super({
      name: options.name ?? 'Concentration',
      detail: options.detail ?? 'Focuses and stabilizes the mind on a single object.',
      color: options.color ?? '#38bdf8',
      opacity: options.opacity ?? 0.55,
      motionSpeed: options.motionSpeed ?? 0,
      ...options,
    })
  }

  override getType(): string {
    return 'concentration_mental'
  }
}

export default ConcentrationMental

