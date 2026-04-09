import GoodMental from './GoodMental';
import type { MentalBaseOptions } from '../AbstractMental';
import angelEmojiModel from '../../../assets/emoji/angel_emoji.glb?url';
export class FaithMental extends GoodMental {
    constructor(options: MentalBaseOptions = {}) {
        super({
            name: options.name ?? 'Faith (Saddhā)',
            detail: options.detail ?? 'Confidence/trust that clarifies and steadies the mind',
            motionSpeed: options.motionSpeed ?? 0,
            ...options,
            modelPath: options.modelPath ?? angelEmojiModel,
            modelTargetWorldSize: options.modelTargetWorldSize ?? 6.506,
            modelOffset: options.modelOffset ?? { x: 0, y: -0.80, z: 0 },
        });
    }
    override getType(): string {
        return 'faith_mental';
    }
}
export default FaithMental;
