import NeutralMental from './NeutralMental';
import type { MentalBaseOptions } from '../AbstractMental';
export class EnergyMental extends NeutralMental {
    constructor(options: MentalBaseOptions = {}) {
        super({
            name: options.name ?? 'Energy',
            detail: options.detail ?? 'Viriya: effort / energy that supports perseverance',
            color: options.color ?? '#22c55e',
            opacity: options.opacity ?? 0.55,
            motionSpeed: options.motionSpeed ?? 0,
            ...options,
        });
    }
    override getType(): string {
        return 'energy_mental';
    }
}
export default EnergyMental;
