import NeutralMental from './NeutralMental';
import type { MentalBaseOptions } from '../AbstractMental';
export class DesireMental extends NeutralMental {
    constructor(options: MentalBaseOptions = {}) {
        super({
            name: options.name ?? 'Desire',
            detail: options.detail ?? 'Chanda: desire-to-do / zeal / intention-to-engage',
            color: options.color ?? '#fb7185',
            opacity: options.opacity ?? 0.55,
            motionSpeed: options.motionSpeed ?? 0,
            ...options,
        });
    }
    override getType(): string {
        return 'desire_mental';
    }
}
export default DesireMental;
