import BadMental from './BadMental';
import type { MentalBaseOptions } from '../AbstractMental';
import sleepyEmojiModel from '../../../assets/emoji/sleepy_emoji.glb?url';
export class TorporMental extends BadMental {
    constructor(options: MentalBaseOptions = {}) {
        super({
            name: options.name ?? 'Torpor',
            detail: options.detail ?? 'Dullness / heaviness; lack of alertness',
            color: options.color ?? '#f97316',
            opacity: options.opacity ?? 0.5,
            motionSpeed: options.motionSpeed ?? 0,
            ...options,
            modelPath: options.modelPath ?? sleepyEmojiModel,
            modelTargetWorldSize: options.modelTargetWorldSize ?? 5.7,
            modelOffset: options.modelOffset ?? { x: 0, y: -0.65, z: -0.1 },
        });
    }
    override getType(): string {
        return 'torpor_mental';
    }
}
export default TorporMental;
