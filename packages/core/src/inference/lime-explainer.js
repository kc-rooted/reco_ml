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
exports.explainPrediction = explainPrediction;
const tf = __importStar(require("@tensorflow/tfjs-node"));
const data_preprocessing_1 = require("../training/data-preprocessing");
const shaft_mappings_1 = require("./shaft-mappings");
const FEATURE_NAMES = [
    'Swing Speed',
    'Current Shot Shape',
    'Shot Shape Preference',
    'Trajectory Preference',
    'Feel Preference'
];
/**
 * LIME-inspired explanation for individual predictions
 * Perturbs each feature and measures impact on prediction for target shaft
 */
async function explainPrediction(model, userAnswers, targetShaftIndex, baseProbabilities) {
    const baseProbability = baseProbabilities[targetShaftIndex];
    const featureImportances = [];
    // Original input vector
    const baseInput = [
        (0, data_preprocessing_1.encodeSwingSpeed)(userAnswers.swing_speed),
        (0, data_preprocessing_1.encodeCurrentShotShape)(userAnswers.current_shot_shape),
        userAnswers.shot_shape_slider,
        userAnswers.trajectory_slider,
        userAnswers.feel_slider
    ];
    // 1. Perturb swing speed
    const swingSpeedImpact = await perturbSwingSpeed(model, userAnswers, targetShaftIndex, baseProbability);
    featureImportances.push({
        feature: FEATURE_NAMES[0],
        importance: Math.abs(swingSpeedImpact),
        direction: swingSpeedImpact >= 0 ? 'positive' : 'negative',
        baseValue: userAnswers.swing_speed
    });
    // 2. Perturb shot shape
    const shotShapeImpact = await perturbShotShape(model, userAnswers, targetShaftIndex, baseProbability);
    featureImportances.push({
        feature: FEATURE_NAMES[1],
        importance: Math.abs(shotShapeImpact),
        direction: shotShapeImpact >= 0 ? 'positive' : 'negative',
        baseValue: userAnswers.current_shot_shape
    });
    // 3. Perturb shot shape slider
    const shotShapeSliderImpact = await perturbSlider(model, userAnswers, 'shot_shape_slider', targetShaftIndex, baseProbability);
    featureImportances.push({
        feature: FEATURE_NAMES[2],
        importance: Math.abs(shotShapeSliderImpact),
        direction: shotShapeSliderImpact >= 0 ? 'positive' : 'negative',
        baseValue: userAnswers.shot_shape_slider.toFixed(2)
    });
    // 4. Perturb trajectory slider
    const trajectorySliderImpact = await perturbSlider(model, userAnswers, 'trajectory_slider', targetShaftIndex, baseProbability);
    featureImportances.push({
        feature: FEATURE_NAMES[3],
        importance: Math.abs(trajectorySliderImpact),
        direction: trajectorySliderImpact >= 0 ? 'positive' : 'negative',
        baseValue: userAnswers.trajectory_slider.toFixed(2)
    });
    // 5. Perturb feel slider
    const feelSliderImpact = await perturbSlider(model, userAnswers, 'feel_slider', targetShaftIndex, baseProbability);
    featureImportances.push({
        feature: FEATURE_NAMES[4],
        importance: Math.abs(feelSliderImpact),
        direction: feelSliderImpact >= 0 ? 'positive' : 'negative',
        baseValue: userAnswers.feel_slider.toFixed(2)
    });
    // Normalize importances to percentages
    const totalImportance = featureImportances.reduce((sum, f) => sum + f.importance, 0);
    featureImportances.forEach(f => {
        f.importance = totalImportance > 0 ? (f.importance / totalImportance) * 100 : 0;
    });
    // Sort by importance descending
    featureImportances.sort((a, b) => b.importance - a.importance);
    return {
        shaftName: '', // Will be filled by caller
        shaftIndex: targetShaftIndex,
        probability: baseProbability,
        featureImportances
    };
}
async function perturbSwingSpeed(model, userAnswers, targetShaftIndex, baseProbability) {
    const swingSpeeds = Object.keys(shaft_mappings_1.SWING_SPEED_MAPPING);
    let totalDelta = 0;
    let count = 0;
    for (const speed of swingSpeeds) {
        if (speed === userAnswers.swing_speed)
            continue;
        const perturbedAnswers = { ...userAnswers, swing_speed: speed };
        const input = [
            (0, data_preprocessing_1.encodeSwingSpeed)(perturbedAnswers.swing_speed),
            (0, data_preprocessing_1.encodeCurrentShotShape)(perturbedAnswers.current_shot_shape),
            perturbedAnswers.shot_shape_slider,
            perturbedAnswers.trajectory_slider,
            perturbedAnswers.feel_slider
        ];
        const inputTensor = tf.tensor2d([input]);
        const prediction = model.predict(inputTensor);
        const probabilities = await prediction.data();
        const delta = baseProbability - probabilities[targetShaftIndex];
        totalDelta += Math.abs(delta);
        count++;
        inputTensor.dispose();
        prediction.dispose();
    }
    return count > 0 ? totalDelta / count : 0;
}
async function perturbShotShape(model, userAnswers, targetShaftIndex, baseProbability) {
    const shotShapes = Object.keys(shaft_mappings_1.SHOT_SHAPE_MAPPING);
    let totalDelta = 0;
    let count = 0;
    for (const shape of shotShapes) {
        if (shape === userAnswers.current_shot_shape)
            continue;
        const perturbedAnswers = { ...userAnswers, current_shot_shape: shape };
        const input = [
            (0, data_preprocessing_1.encodeSwingSpeed)(perturbedAnswers.swing_speed),
            (0, data_preprocessing_1.encodeCurrentShotShape)(perturbedAnswers.current_shot_shape),
            perturbedAnswers.shot_shape_slider,
            perturbedAnswers.trajectory_slider,
            perturbedAnswers.feel_slider
        ];
        const inputTensor = tf.tensor2d([input]);
        const prediction = model.predict(inputTensor);
        const probabilities = await prediction.data();
        const delta = baseProbability - probabilities[targetShaftIndex];
        totalDelta += Math.abs(delta);
        count++;
        inputTensor.dispose();
        prediction.dispose();
    }
    return count > 0 ? totalDelta / count : 0;
}
async function perturbSlider(model, userAnswers, sliderName, targetShaftIndex, baseProbability) {
    // Perturb slider by ±0.5
    const perturbations = [
        userAnswers[sliderName] + 0.5,
        userAnswers[sliderName] - 0.5
    ].map(v => Math.max(-1, Math.min(1, v)));
    let totalDelta = 0;
    let count = 0;
    for (const perturbedValue of perturbations) {
        if (perturbedValue === userAnswers[sliderName])
            continue;
        const perturbedAnswers = { ...userAnswers, [sliderName]: perturbedValue };
        const input = [
            (0, data_preprocessing_1.encodeSwingSpeed)(perturbedAnswers.swing_speed),
            (0, data_preprocessing_1.encodeCurrentShotShape)(perturbedAnswers.current_shot_shape),
            perturbedAnswers.shot_shape_slider,
            perturbedAnswers.trajectory_slider,
            perturbedAnswers.feel_slider
        ];
        const inputTensor = tf.tensor2d([input]);
        const prediction = model.predict(inputTensor);
        const probabilities = await prediction.data();
        const delta = baseProbability - probabilities[targetShaftIndex];
        totalDelta += Math.abs(delta);
        count++;
        inputTensor.dispose();
        prediction.dispose();
    }
    return count > 0 ? totalDelta / count : 0;
}
//# sourceMappingURL=lime-explainer.js.map