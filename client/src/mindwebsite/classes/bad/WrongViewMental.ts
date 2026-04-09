import BadMental from './BadMental';
import type { MentalBaseOptions } from '../AbstractMental';
import spiralEmojiModel from '../../../assets/emoji/spiral_emoji.glb?url';
export class WrongViewMental extends BadMental {
    constructor(options: MentalBaseOptions = {}) {
        super({
            name: options.name ?? 'Wrong View',
            detail: options.detail ?? 'Distorted view; clinging to mistaken beliefs as true',
            color: options.color ?? '#fb7185',
            opacity: options.opacity ?? 0.5,
            motionSpeed: options.motionSpeed ?? 0,
            ...options,
            modelPath: options.modelPath ?? spiralEmojiModel,
            modelTargetWorldSize: options.modelTargetWorldSize ?? 6.506,
            modelOffset: options.modelOffset ?? { x: 0, y: -0.65, z: -0.8 },
        });
    }
    override getType(): string {
        return 'wrong_view_mental';
    }
}
export default WrongViewMental;
