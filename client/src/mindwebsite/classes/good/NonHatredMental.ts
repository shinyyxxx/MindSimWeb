import GoodMental from './GoodMental';
import type { MentalBaseOptions } from '../AbstractMental';
import closeKissEmojiModel from '../../../assets/emoji/closeKiss_emoji.glb?url';
export class NonHatredMental extends GoodMental {
    constructor(options: MentalBaseOptions = {}) {
        super({
            name: options.name ?? 'Non-hatred (Adosa)',
            detail: options.detail ?? 'Goodwill: absence of aversion, enabling kindness and patience',
            motionSpeed: options.motionSpeed ?? 0,
            ...options,
            modelPath: options.modelPath ?? closeKissEmojiModel,
            modelTargetWorldSize: options.modelTargetWorldSize ?? 6.506,
            modelOffset: options.modelOffset ?? { x: 0, y: -0.65, z: 0 },
        });
    }
    override getType(): string {
        return 'non_hatred_mental';
    }
}
export default NonHatredMental;
