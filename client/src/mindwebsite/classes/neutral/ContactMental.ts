import UniversalMental from './UniversalMental';
import type { MentalBaseOptions } from '../AbstractMental';
export class ContactMental extends UniversalMental {
    constructor(options: MentalBaseOptions = {}) {
        super({
            name: options.name ?? 'Contact',
            detail: options.detail ?? 'Brings together sense organ, object, and consciousness to initiate experience.',
            color: options.color ?? '#ff6b6b',
            opacity: options.opacity ?? 0.55,
            motionSpeed: options.motionSpeed ?? 0,
            ...options,
        });
    }
    override getType(): string {
        return 'contact_mental';
    }
}
export default ContactMental;
