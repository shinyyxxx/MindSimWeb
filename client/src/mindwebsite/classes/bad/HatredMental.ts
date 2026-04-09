import BadMental from './BadMental';
import type { MentalBaseOptions } from '../AbstractMental';
import angerEmojiModel from '../../../assets/emoji/anger_emoji.glb?url';
export class HatredMental extends BadMental {
    constructor(options: MentalBaseOptions = {}) {
        super({
            name: options.name ?? 'Hatred',
            detail: options.detail ?? 'Aversion / ill-will; pushing away an object',
            color: options.color ?? '#ef4444',
            opacity: options.opacity ?? 0.5,
            motionSpeed: options.motionSpeed ?? 0,
            ...options,
            modelPath: options.modelPath ?? angerEmojiModel,
            modelTargetWorldSize: options.modelTargetWorldSize ?? 0.006,
            modelOffset: options.modelOffset ?? { x: 0, y: -0.65, z: 0 },
        });
    }
    override getType(): string {
        return 'hatred_mental';
    }
}
export default HatredMental;
