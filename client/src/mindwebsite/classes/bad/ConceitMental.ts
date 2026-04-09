import BadMental from './BadMental';
import type { MentalBaseOptions } from '../AbstractMental';
import sunglassCoolEmojiModel from '../../../assets/emoji/sunglassCool_emoji.glb?url';
export class ConceitMental extends BadMental {
    constructor(options: MentalBaseOptions = {}) {
        super({
            name: options.name ?? 'Conceit',
            detail: options.detail ?? 'Measuring / comparing; inflated sense of self',
            color: options.color ?? '#fb7185',
            opacity: options.opacity ?? 0.5,
            motionSpeed: options.motionSpeed ?? 0,
            ...options,
            modelPath: options.modelPath ?? sunglassCoolEmojiModel,
            modelTargetWorldSize: options.modelTargetWorldSize ?? 6.506,
            modelOffset: options.modelOffset ?? { x: 0, y: -0.65, z: 0 },
        });
    }
    override getType(): string {
        return 'conceit_mental';
    }
}
export default ConceitMental;
