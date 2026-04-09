import NeutralMental from './NeutralMental';
import type { MentalBaseOptions } from '../AbstractMental';
export class SustainedApplicationMental extends NeutralMental {
    constructor(options: MentalBaseOptions = {}) {
        super({
            name: options.name ?? 'Sustained Application',
            detail: options.detail ?? 'Vicāra: keeping the mind engaged with the object (sustained application)',
            color: options.color ?? '#64748b',
            opacity: options.opacity ?? 0.55,
            motionSpeed: options.motionSpeed ?? 0,
            ...options,
        });
    }
    override getType(): string {
        return 'sustained_application_mental';
    }
}
export default SustainedApplicationMental;
