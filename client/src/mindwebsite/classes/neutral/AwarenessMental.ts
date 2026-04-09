import NeutralMental from './NeutralMental';
import type { MentalBaseOptions } from '../AbstractMental';
export class AwarenessMental extends NeutralMental {
    constructor(options: MentalBaseOptions = {}) {
        super({
            name: options.name ?? 'Awareness',
            detail: options.detail ?? 'Monitoring quality of mind',
            color: options.color ?? '#a1a1aa',
            opacity: options.opacity ?? 0.55,
            motionSpeed: options.motionSpeed ?? 0,
            ...options,
        });
    }
    override getType(): string {
        return 'awareness_mental';
    }
}
export default AwarenessMental;
