import BadMental from './BadMental';
import type { MentalBaseOptions } from '../AbstractMental';
import unamuseEmojiModel from '../../../assets/emoji/unamuse_emoji.glb?url';
export class EnvyMental extends BadMental {
    constructor(options: MentalBaseOptions = {}) {
        super({
            name: options.name ?? 'Envy',
            detail: options.detail ?? "Resentment at others' success or happiness",
            color: options.color ?? '#f59e0b',
            opacity: options.opacity ?? 0.5,
            motionSpeed: options.motionSpeed ?? 0,
            ...options,
            modelPath: options.modelPath ?? unamuseEmojiModel,
            modelTargetWorldSize: options.modelTargetWorldSize ?? 6.506,
            modelOffset: options.modelOffset ?? { x: 0, y: -0.65, z: 0 },
        });
    }
    override getType(): string {
        return 'envy_mental';
    }
}
export default EnvyMental;
