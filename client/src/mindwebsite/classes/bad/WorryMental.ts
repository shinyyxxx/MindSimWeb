import BadMental from './BadMental';
import type { MentalBaseOptions } from '../AbstractMental';
import anxiousEmojiModel from '../../../assets/emoji/anxious_emoji.glb?url';
export class WorryMental extends BadMental {
    constructor(options: MentalBaseOptions = {}) {
        super({
            name: options.name ?? 'Worry',
            detail: options.detail ?? 'Agitated remorse; uneasy regret about actions',
            color: options.color ?? '#f43f5e',
            opacity: options.opacity ?? 0.5,
            motionSpeed: options.motionSpeed ?? 0,
            ...options,
            modelPath: options.modelPath ?? anxiousEmojiModel,
            modelTargetWorldSize: options.modelTargetWorldSize ?? 6.506,
            modelOffset: options.modelOffset ?? { x: 0, y: -0.65, z: -0.8 },
        });
    }
    override getType(): string {
        return 'worry_mental';
    }
}
export default WorryMental;
