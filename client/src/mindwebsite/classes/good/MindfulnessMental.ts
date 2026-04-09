import GoodMental from './GoodMental';
import type { MentalBaseOptions } from '../AbstractMental';
import monocleEmojiModel from '../../../assets/emoji/monocle_emoji.glb?url';
export class MindfulnessMental extends GoodMental {
    constructor(options: MentalBaseOptions = {}) {
        super({
            name: options.name ?? 'Mindfulness (Sati)',
            detail: options.detail ?? 'Non-forgetfulness: keeping the object in mind with clear presence',
            motionSpeed: options.motionSpeed ?? 0,
            ...options,
            modelPath: options.modelPath ?? monocleEmojiModel,
            modelTargetWorldSize: options.modelTargetWorldSize ?? 6.506,
            modelOffset: options.modelOffset ?? { x: 0, y: -0.65, z: 0 },
        });
    }
    override getType(): string {
        return 'mindfulness_mental';
    }
}
export default MindfulnessMental;
