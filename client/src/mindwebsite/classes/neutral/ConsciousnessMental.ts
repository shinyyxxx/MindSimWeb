import NeutralMental from './NeutralMental';
import type { MentalBaseOptions } from '../AbstractMental';
export class ConsciousnessMental extends NeutralMental {
    constructor(options: MentalBaseOptions = {}) {
        super({
            name: options.name ?? 'Consciousness',
            detail: options.detail ?? 'Knowing of the object',
            color: options.color ?? '#a1a1aa',
            opacity: options.opacity ?? 0.55,
            motionSpeed: options.motionSpeed ?? 0,
            ...options,
        });
    }
    override getType(): string {
        return 'consciousness_mental';
    }
}
export default ConsciousnessMental;
