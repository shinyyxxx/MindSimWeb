import GoodMental from './GoodMental';
import type { MentalBaseOptions } from '../AbstractMental';
import bigSmileEmojiModel from '../../../assets/emoji/bigSmile_emoji.glb?url';
export class WieldinessMindMental extends GoodMental {
    constructor(options: MentalBaseOptions = {}) {
        super({
            name: options.name ?? 'Wieldiness (Mind)',
            detail: options.detail ?? 'Cittakammaññatā: adaptability/workability of consciousness (citta)',
            motionSpeed: options.motionSpeed ?? 0,
            ...options,
            modelPath: options.modelPath ?? bigSmileEmojiModel,
            modelTargetWorldSize: options.modelTargetWorldSize ?? 6.506,
            modelOffset: options.modelOffset ?? { x: 0, y: -0.65, z: 0 },
        });
    }
    override getType(): string {
        return 'wieldiness_mind_mental';
    }
}
export default WieldinessMindMental;
