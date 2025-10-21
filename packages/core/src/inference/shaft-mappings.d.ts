export declare const SHAFT_NAMES: readonly ["OVVIO Red 4A", "OVVIO Red 4R", "OVVIO Red 5R", "OVVIO Green 5S", "OVVIO Green 6S", "OVVIO Green 6X", "OVVIO Green 7X", "OVVIO Blue 5R", "OVVIO Blue 5S", "OVVIO Blue 6S", "OVVIO Blue 7X"];
export type ShaftName = typeof SHAFT_NAMES[number];
export declare const SHAFT_INDEX: {
    [key: string]: number;
};
export declare const SWING_SPEED_MAPPING: {
    readonly under85: 0;
    readonly '85-95': 1;
    readonly '96-105': 2;
    readonly '106-115': 3;
    readonly over115: 4;
};
export declare const SHOT_SHAPE_MAPPING: {
    readonly fade: 0;
    readonly draw: 1;
    readonly straight: 2;
};
export type SwingSpeed = keyof typeof SWING_SPEED_MAPPING;
export type ShotShape = keyof typeof SHOT_SHAPE_MAPPING;
//# sourceMappingURL=shaft-mappings.d.ts.map