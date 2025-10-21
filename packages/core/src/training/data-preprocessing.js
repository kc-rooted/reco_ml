"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeSwingSpeed = encodeSwingSpeed;
exports.encodeCurrentShotShape = encodeCurrentShotShape;
exports.createTargetDistribution = createTargetDistribution;
exports.preprocessTrainingData = preprocessTrainingData;
exports.normalizeSliderValues = normalizeSliderValues;
const tf = __importStar(require("@tensorflow/tfjs-node"));
const shaft_mappings_1 = require("../inference/shaft-mappings");
function encodeSwingSpeed(speed) {
    return shaft_mappings_1.SWING_SPEED_MAPPING[speed] ?? 2;
}
function encodeCurrentShotShape(shape) {
    return shaft_mappings_1.SHOT_SHAPE_MAPPING[shape] ?? 2;
}
function createTargetDistribution(shaft1Name, shaft2Name, prob1 = 0.6, prob2 = 0.35) {
    const target = new Array(shaft_mappings_1.SHAFT_NAMES.length).fill(0);
    const shaft1Index = shaft_mappings_1.SHAFT_INDEX[shaft1Name];
    const shaft2Index = shaft_mappings_1.SHAFT_INDEX[shaft2Name];
    if (shaft1Index !== undefined) {
        target[shaft1Index] = 1;
    }
    if (shaft2Index !== undefined) {
        target[shaft2Index] = 1;
    }
    return target;
}
function preprocessTrainingData(rawData) {
    const inputs = [];
    const outputs = [];
    for (const record of rawData) {
        const input = [
            encodeSwingSpeed(record.swing_speed),
            encodeCurrentShotShape(record.current_shot_shape),
            record.shot_shape_slider,
            record.trajectory_slider,
            record.feel_slider
        ];
        const targetDistribution = createTargetDistribution(record.recommended_shaft_1, record.recommended_shaft_2, record.success_probability_1 || 0.6, record.success_probability_2 || 0.35);
        inputs.push(input);
        outputs.push(targetDistribution);
    }
    const inputTensor = tf.tensor2d(inputs);
    const outputTensor = tf.tensor2d(outputs);
    return { inputTensor, outputTensor };
}
function normalizeSliderValues(value) {
    return Math.max(-1, Math.min(1, value));
}
//# sourceMappingURL=data-preprocessing.js.map