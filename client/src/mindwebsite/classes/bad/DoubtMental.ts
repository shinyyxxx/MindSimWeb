import BadMental from './BadMental';
import type { MentalBaseOptions } from '../AbstractMental';
import eyebrowRaiseEmojiModel from '../../../assets/emoji/eyebrowRaise_emoji.glb?url';
export class DoubtMental extends BadMental {
    constructor(options: MentalBaseOptions = {}) {
        super({
            name: options.name ?? 'Doubt',
            detail: options.detail ?? 'Skeptical wavering that blocks commitment and clarity',
            color: options.color ?? '#f97316',
            opacity: options.opacity ?? 0.5,
            motionSpeed: options.motionSpeed ?? 0,
            ...options,
            modelPath: options.modelPath ?? eyebrowRaiseEmojiModel,
            modelTargetWorldSize: options.modelTargetWorldSize ?? 6.506,
            modelOffset: options.modelOffset ?? { x: 0, y: -0.65, z: 0 },
        });
    }
    override getType(): string {
        return 'doubt_mental';
    }
}
export default DoubtMental;
