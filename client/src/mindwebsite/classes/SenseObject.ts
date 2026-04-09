export interface SenseObjectOptions {
    id: string;
    label: string;
    modelPath?: string;
    position?: [
        number,
        number,
        number
    ];
    scale?: number;
    triggerLine: string;
    primitive?: 'sphere' | 'box';
    primitiveColor?: string;
    ambientBoost?: number;
    pointLights?: Array<{
        position: [
            number,
            number,
            number
        ];
        intensity?: number;
        color?: string;
    }>;
}
export class SenseObject {
    readonly id: string;
    readonly label: string;
    readonly modelPath: string | undefined;
    readonly position: [
        number,
        number,
        number
    ];
    readonly scale: number;
    readonly triggerLine: string;
    readonly primitive: 'sphere' | 'box' | undefined;
    readonly primitiveColor: string;
    readonly ambientBoost: number;
    readonly pointLights: Array<{
        position: [
            number,
            number,
            number
        ];
        intensity?: number;
        color?: string;
    }>;
    constructor(options: SenseObjectOptions) {
        this.id = options.id;
        this.label = options.label;
        this.modelPath = options.modelPath;
        this.position = options.position ?? [0, 0, 0];
        this.scale = options.scale ?? 1;
        this.triggerLine = options.triggerLine;
        this.primitive = options.primitive;
        this.primitiveColor = options.primitiveColor ?? '#94a3b8';
        this.ambientBoost = options.ambientBoost ?? 0.25;
        this.pointLights = options.pointLights ?? [
            { position: [1, 1, 1], intensity: 0.3, color: '#ffffff' },
        ];
    }
    shouldShow(subtitleLine: string | null): boolean {
        return subtitleLine === this.triggerLine;
    }
}
