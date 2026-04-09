import Mental from '../Mental';
import type { MentalBaseOptions } from '../AbstractMental';
import happyEmojiModel from '../../../assets/emoji/happy_emoji.glb?url';
export class GoodMental extends Mental {
    constructor(options: MentalBaseOptions = {}) {
        super({
            color: '#22c55e',
            motionSpeed: options.motionSpeed ?? 0.0018,
            opacity: options.opacity ?? 0.5,
            ...options,
            modelPath: options.modelPath ?? happyEmojiModel,
            modelTargetWorldSize: options.modelTargetWorldSize ?? 0.02,
            modelOffset: options.modelOffset ?? { x: 0, y: -0.02, z: 0 },
        });
        (this as any).side = 'left';
    }
    override getType(): string {
        return 'good_mental';
    }
}
export default GoodMental;
