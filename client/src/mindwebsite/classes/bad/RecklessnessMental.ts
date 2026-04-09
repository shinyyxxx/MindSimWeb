import BadMental from './BadMental';
import type { MentalBaseOptions } from '../AbstractMental';
import winkTongueEmojiModel from '../../../assets/emoji/winkTongue_emoji.glb?url';
export class RecklessnessMental extends BadMental {
    constructor(options: MentalBaseOptions = {}) {
        super({
            name: options.name ?? 'Recklessness',
            detail: options.detail ?? 'Lack of moral fear; disregard for consequences',
            color: options.color ?? '#fb7185',
            opacity: options.opacity ?? 0.5,
            motionSpeed: options.motionSpeed ?? 0,
            ...options,
            modelPath: options.modelPath ?? winkTongueEmojiModel,
            modelTargetWorldSize: options.modelTargetWorldSize ?? 6.506,
            modelOffset: options.modelOffset ?? { x: 0, y: -0.65, z: -0.1 },
        });
    }
    override getType(): string {
        return 'recklessness_mental';
    }
}
export default RecklessnessMental;
