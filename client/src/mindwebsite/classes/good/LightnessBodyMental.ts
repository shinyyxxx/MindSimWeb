import GoodMental from './GoodMental';
import type { MentalBaseOptions } from '../AbstractMental';
import laughTearEmojiModel from '../../../assets/emoji/laughTear_emoji.glb?url';
export class LightnessBodyMental extends GoodMental {
    constructor(options: MentalBaseOptions = {}) {
        super({
            name: options.name ?? 'Lightness (Mental Body)',
            detail: options.detail ?? 'Kāyalahutā: lightness of associated mental factors',
            motionSpeed: options.motionSpeed ?? 0,
            ...options,
            modelPath: options.modelPath ?? laughTearEmojiModel,
            modelTargetWorldSize: options.modelTargetWorldSize ?? 6.506,
            modelOffset: options.modelOffset ?? { x: 0, y: -0.65, z: 0 },
        });
    }
    override getType(): string {
        return 'lightness_body_mental';
    }
}
export default LightnessBodyMental;
