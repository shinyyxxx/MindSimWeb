import Mind from './Mind';
import MaterialForm from './MaterialForm';
import type { MindBaseOptions } from './AbstractMind';
export type LifeOptions = {
    name?: string;
    detail?: string;
    mindOptions?: MindBaseOptions;
    materialFormOptions?: MindBaseOptions;
};
export class Life {
    name: string;
    detail: string;
    private mind: Mind;
    private materialForm: MaterialForm;
    constructor(options: LifeOptions = {}) {
        this.name = options.name ?? 'Life';
        this.detail = options.detail ?? '';
        this.mind = new Mind(options.mindOptions ?? {
            name: 'Mind',
            detail: 'Mind sphere',
        });
        this.materialForm = new MaterialForm(options.materialFormOptions ?? {
            name: 'Material Form',
            detail: 'Material form sphere',
        });
    }
    getMind(): Mind {
        return this.mind;
    }
    getMaterialForm(): MaterialForm {
        return this.materialForm;
    }
    dispose(): void {
        this.mind.dispose();
        this.materialForm.dispose();
    }
}
export default Life;
