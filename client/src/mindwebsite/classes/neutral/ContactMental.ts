import NeutralMental from './NeutralMental'
import type { MentalBaseOptions } from '../AbstractMental'

/**
 * Universal mental factor: Contact (Phassa)
 */
export class ContactMental extends NeutralMental {
  constructor(options: MentalBaseOptions = {}) {
    super({
      name: options.name ?? 'Contact',
      detail: options.detail ?? 'Brings together sense organ, object, and consciousness to initiate experience.',
      color: options.color ?? '#ff6b6b',
      opacity: options.opacity ?? 0.55,
      // Universal mentals are frozen in MindWebsiteScene; keep a low default here too.
      motionSpeed: options.motionSpeed ?? 0,
      ...options,
    })
  }

  override getType(): string {
    return 'contact_mental'
  }
}

export default ContactMental


