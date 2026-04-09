import GoodMental from './GoodMental';
import type { MentalBaseOptions } from '../AbstractMental';
import neutralEmojiModel from '../../../assets/emoji/neutral_emoji.glb?url';
export class EquanimityMental extends GoodMental {
    constructor(options: MentalBaseOptions = {}) {
        super({
            name: options.name ?? 'Equanimity (Tatramajjhattatā)',
            detail: options.detail ?? 'Even-minded balance toward objects; impartiality',
            motionSpeed: options.motionSpeed ?? 0,
            ...options,
            modelPath: options.modelPath ?? neutralEmojiModel,
            modelTargetWorldSize: options.modelTargetWorldSize ?? 6.506,
            modelOffset: options.modelOffset ?? { x: 0, y: -0.65, z: 0 },
        });
    }
    override getType(): string {
        return 'equanimity_mental';
    }
}
export default EquanimityMental;
