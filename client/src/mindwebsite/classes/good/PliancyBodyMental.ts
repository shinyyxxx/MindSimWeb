import GoodMental from './GoodMental';
import type { MentalBaseOptions } from '../AbstractMental';
import looseTongueEmojiModel from '../../../assets/emoji/looseTongue_emoji.glb?url';
export class PliancyBodyMental extends GoodMental {
    constructor(options: MentalBaseOptions = {}) {
        super({
            name: options.name ?? 'Pliancy (Mental Body)',
            detail: options.detail ?? 'Kāyamudutā: softness/pliancy of associated mental factors',
            motionSpeed: options.motionSpeed ?? 0,
            ...options,
            modelPath: options.modelPath ?? looseTongueEmojiModel,
            modelTargetWorldSize: options.modelTargetWorldSize ?? 6.506,
            modelOffset: options.modelOffset ?? { x: 0, y: -0.65, z: 0 },
        });
    }
    override getType(): string {
        return 'pliancy_body_mental';
    }
}
export default PliancyBodyMental;
