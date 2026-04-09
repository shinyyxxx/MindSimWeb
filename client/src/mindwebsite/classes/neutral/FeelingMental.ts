import UniversalMental from './UniversalMental';
import type { MentalBaseOptions } from '../AbstractMental';
export class FeelingMental extends UniversalMental {
    constructor(options: MentalBaseOptions = {}) {
        super({
            name: options.name ?? 'Feeling',
            detail: options.detail ?? 'Experiences the emotional tone of the object as pleasant, unpleasant, or neutral.',
            color: options.color ?? '#4ecdc4',
            opacity: options.opacity ?? 0.55,
            motionSpeed: options.motionSpeed ?? 0,
            ...options,
        });
    }
    override getType(): string {
        return 'feeling_mental';
    }
}
export default FeelingMental;
