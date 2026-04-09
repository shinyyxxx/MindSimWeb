import BadMental from './BadMental';
import type { MentalBaseOptions } from '../AbstractMental';
import sleepingEmojiModel from '../../../assets/emoji/sleeping_emoji.glb?url';
export class SlothMental extends BadMental {
    constructor(options: MentalBaseOptions = {}) {
        super({
            name: options.name ?? 'Sloth',
            detail: options.detail ?? 'Mental sluggishness; lack of initiative',
            color: options.color ?? '#f97316',
            opacity: options.opacity ?? 0.5,
            motionSpeed: options.motionSpeed ?? 0,
            ...options,
            modelPath: options.modelPath ?? sleepingEmojiModel,
            modelTargetWorldSize: options.modelTargetWorldSize ?? 5.8,
            modelOffset: options.modelOffset ?? { x: 0, y: -0.65, z: -1.3 },
        });
    }
    override getType(): string {
        return 'sloth_mental';
    }
}
export default SlothMental;
