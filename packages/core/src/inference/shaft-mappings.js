"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SHOT_SHAPE_MAPPING = exports.SWING_SPEED_MAPPING = exports.SHAFT_INDEX = exports.SHAFT_NAMES = void 0;
exports.SHAFT_NAMES = [
    'OVVIO Red 4A',
    'OVVIO Red 4R',
    'OVVIO Red 5R',
    'OVVIO Green 5S',
    'OVVIO Green 6S',
    'OVVIO Green 6X',
    'OVVIO Green 7X',
    'OVVIO Blue 5R',
    'OVVIO Blue 5S',
    'OVVIO Blue 6S',
    'OVVIO Blue 7X'
];
exports.SHAFT_INDEX = {};
exports.SHAFT_NAMES.forEach((name, index) => {
    exports.SHAFT_INDEX[name] = index;
});
exports.SWING_SPEED_MAPPING = {
    'under85': 0,
    '85-95': 1,
    '96-105': 2,
    '106-115': 3,
    'over115': 4
};
exports.SHOT_SHAPE_MAPPING = {
    'fade': 0,
    'draw': 1,
    'straight': 2
};
//# sourceMappingURL=shaft-mappings.js.map