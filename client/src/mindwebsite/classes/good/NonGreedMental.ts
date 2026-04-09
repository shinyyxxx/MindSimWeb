import GoodMental from './GoodMental';
import type { MentalBaseOptions } from '../AbstractMental';
import smilingEmojiModel from '../../../assets/emoji/smiling_emoji.glb?url';
export class NonGreedMental extends GoodMental {
    constructor(options: MentalBaseOptions = {}) {
        super({
            name: options.name ?? 'Non-greed (Alobha)',
            detail: options.detail ?? 'Detachment: freedom from clinging and possessiveness',
            motionSpeed: options.motionSpeed ?? 0,
            ...options,
            modelPath: options.modelPath ?? smilingEmojiModel,
            modelTargetWorldSize: options.modelTargetWorldSize ?? 6.506,
            modelOffset: options.modelOffset ?? { x: 0, y: -0.70, z: 0 },
        });
    }
    override getType(): string {
        return 'non_greed_mental';
    }
}
export default NonGreedMental;
