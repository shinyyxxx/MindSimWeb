import Mental from '../Mental';
import type { MentalBaseOptions } from '../AbstractMental';
export class NeutralMental extends Mental {
    constructor(options: MentalBaseOptions = {}) {
        super({
            color: '#a1a1aa',
            motionSpeed: options.motionSpeed ?? 0.002,
            opacity: options.opacity ?? 0.5,
            ...options,
        });
        (this as any).zone = 'bottom';
    }
    override getType(): string {
        return 'neutral_mental';
    }
}
export default NeutralMental;
