import GoodMental from './GoodMental';
import type { MentalBaseOptions } from '../AbstractMental';
import determineEmojiModel from '../../../assets/emoji/determine_emoji.glb?url';
export class RectitudeBodyMental extends GoodMental {
    constructor(options: MentalBaseOptions = {}) {
        super({
            name: options.name ?? 'Rectitude (Mental Body)',
            detail: options.detail ?? 'Kāyujukatā: straightness/uprightness of associated mental factors',
            motionSpeed: options.motionSpeed ?? 0,
            ...options,
            modelPath: options.modelPath ?? determineEmojiModel,
            modelTargetWorldSize: options.modelTargetWorldSize ?? 5.500,
            modelOffset: options.modelOffset ?? { x: 0, y: -0.55, z: -0.1 },
        });
    }
    override getType(): string {
        return 'rectitude_body_mental';
    }
}
export default RectitudeBodyMental;
