import NeutralMental from './NeutralMental';
import type { MentalBaseOptions } from '../AbstractMental';
export class RaptureMental extends NeutralMental {
    constructor(options: MentalBaseOptions = {}) {
        super({
            name: options.name ?? 'Rapture',
            detail: options.detail ?? 'Pīti: rapture/joyful interest that refreshes the mind',
            color: options.color ?? '#06b6d4',
            opacity: options.opacity ?? 0.55,
            motionSpeed: options.motionSpeed ?? 0,
            ...options,
        });
    }
    override getType(): string {
        return 'rapture_mental';
    }
}
export default RaptureMental;
