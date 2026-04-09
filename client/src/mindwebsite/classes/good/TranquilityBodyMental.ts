import GoodMental from './GoodMental';
import type { MentalBaseOptions } from '../AbstractMental';
import calmEmojiModel from '../../../assets/emoji/calm_emoji.glb?url';
export class TranquilityBodyMental extends GoodMental {
    constructor(options: MentalBaseOptions = {}) {
        super({
            name: options.name ?? 'Tranquility (Mental Body)',
            detail: options.detail ?? 'Kāyapassaddhi: calming of the associated mental factors (the “mental body”)',
            motionSpeed: options.motionSpeed ?? 0,
            ...options,
            modelPath: options.modelPath ?? calmEmojiModel,
            modelTargetWorldSize: options.modelTargetWorldSize ?? 6.506,
            modelOffset: options.modelOffset ?? { x: 0, y: -0.70, z: 0 },
        });
    }
    override getType(): string {
        return 'tranquility_body_mental';
    }
}
export default TranquilityBodyMental;
