import GoodMental from './GoodMental';
import type { MentalBaseOptions } from '../AbstractMental';
import cowboyEmojiModel from '../../../assets/emoji/cowboy_emoji.glb?url';
export class RightLivelihoodMental extends GoodMental {
    constructor(options: MentalBaseOptions = {}) {
        super({
            name: options.name ?? 'Right Livelihood (Sammā-ājīva)',
            detail: options.detail ?? 'Abstinence from wrong livelihood',
            motionSpeed: options.motionSpeed ?? 0,
            ...options,
            modelPath: options.modelPath ?? cowboyEmojiModel,
            modelTargetWorldSize: options.modelTargetWorldSize ?? 5.506,
            modelOffset: options.modelOffset ?? { x: 0, y: -0.70, z: 0.1 },
        });
    }
    override getType(): string {
        return 'right_livelihood_mental';
    }
}
export default RightLivelihoodMental;
