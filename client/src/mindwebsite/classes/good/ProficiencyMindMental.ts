import GoodMental from './GoodMental';
import type { MentalBaseOptions } from '../AbstractMental';
import nerdEmojiModel from '../../../assets/emoji/nerd_emoji.glb?url';
export class ProficiencyMindMental extends GoodMental {
    constructor(options: MentalBaseOptions = {}) {
        super({
            name: options.name ?? 'Proficiency (Mind)',
            detail: options.detail ?? 'Cittapāguññatā: skillfulness/proficiency of consciousness (citta)',
            motionSpeed: options.motionSpeed ?? 0,
            ...options,
            modelPath: options.modelPath ?? nerdEmojiModel,
            modelTargetWorldSize: options.modelTargetWorldSize ?? 6.506,
            modelOffset: options.modelOffset ?? { x: 0, y: -0.65, z: 0 },
        });
    }
    override getType(): string {
        return 'proficiency_mind_mental';
    }
}
export default ProficiencyMindMental;
