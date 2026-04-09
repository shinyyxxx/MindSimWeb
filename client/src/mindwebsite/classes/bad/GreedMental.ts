import BadMental from './BadMental';
import type { MentalBaseOptions } from '../AbstractMental';
import greedyEmojiModel from '../../../assets/emoji/greedy_emoji.glb?url';
export class GreedMental extends BadMental {
    constructor(options: MentalBaseOptions = {}) {
        super({
            name: options.name ?? 'Greed',
            detail: options.detail ?? 'Craving / attachment toward an object',
            color: options.color ?? '#fb923c',
            opacity: options.opacity ?? 0.5,
            motionSpeed: options.motionSpeed ?? 0,
            ...options,
            modelPath: options.modelPath ?? greedyEmojiModel,
            modelTargetWorldSize: options.modelTargetWorldSize ?? 6.506,
            modelOffset: options.modelOffset ?? { x: 0, y: -0.65, z: -0.1 },
        });
    }
    override getType(): string {
        return 'greed_mental';
    }
}
export default GreedMental;
