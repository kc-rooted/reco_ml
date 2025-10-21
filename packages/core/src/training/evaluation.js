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
exports.makePrediction = makePrediction;
exports.getTopRecommendations = getTopRecommendations;
exports.testKnownPatterns = testKnownPatterns;
exports.evaluateMetrics = evaluateMetrics;
const tf = __importStar(require("@tensorflow/tfjs-node"));
const shaft_mappings_1 = require("../inference/shaft-mappings");
const data_preprocessing_1 = require("./data-preprocessing");
async function makePrediction(model, userAnswers) {
    const input = [
        (0, data_preprocessing_1.encodeSwingSpeed)(userAnswers.swing_speed),
        (0, data_preprocessing_1.encodeCurrentShotShape)(userAnswers.current_shot_shape),
        userAnswers.shot_shape_slider,
        userAnswers.trajectory_slider,
        userAnswers.feel_slider
    ];
    const inputTensor = tf.tensor2d([input]);
    const prediction = model.predict(inputTensor);
    const probabilities = await prediction.data();
    inputTensor.dispose();
    prediction.dispose();
    return Array.from(probabilities);
}
function getTopRecommendations(probabilities, topN = 2) {
    const indexedProbs = probabilities.map((prob, index) => ({
        index,
        probability: prob,
        name: shaft_mappings_1.SHAFT_NAMES[index],
        percentage: Math.round(prob * 100)
    }));
    const sorted = indexedProbs.sort((a, b) => b.probability - a.probability);
    return sorted.slice(0, topN);
}
async function testKnownPatterns(model) {
    const testCases = [
        {
            name: "Slow swing + fade preference",
            input: {
                swing_speed: 'under85',
                current_shot_shape: 'fade',
                shot_shape_slider: 0.8,
                trajectory_slider: 0.5,
                feel_slider: 0.2
            },
            expectedFamily: 'Red'
        },
        {
            name: "Fast swing + draw preference",
            input: {
                swing_speed: 'over115',
                current_shot_shape: 'draw',
                shot_shape_slider: -0.8,
                trajectory_slider: -0.3,
                feel_slider: -0.5
            },
            expectedFamily: 'Green'
        },
        {
            name: "Medium swing + neutral",
            input: {
                swing_speed: '96-105',
                current_shot_shape: 'straight',
                shot_shape_slider: 0.1,
                trajectory_slider: 0.0,
                feel_slider: 0.3
            },
            expectedFamily: 'Blue'
        }
    ];
    console.log('\n🧪 Testing Model with Known Patterns:');
    console.log('=====================================');
    for (const testCase of testCases) {
        const probabilities = await makePrediction(model, testCase.input);
        const recommendations = getTopRecommendations(probabilities, 2);
        console.log(`\nTest: ${testCase.name}`);
        console.log(`Expected: ${testCase.expectedFamily} series shaft`);
        console.log(`Top recommendations:`);
        console.log(`  1. ${recommendations[0].name} (${recommendations[0].percentage}%)`);
        console.log(`  2. ${recommendations[1].name} (${recommendations[1].percentage}%)`);
        const isCorrectFamily = recommendations[0].name.includes(testCase.expectedFamily);
        console.log(`✅ Correct family: ${isCorrectFamily ? 'YES' : 'NO'}`);
    }
}
function evaluateMetrics(history) {
    const finalMetrics = history.history;
    const lastEpoch = finalMetrics.loss.length - 1;
    const trainLoss = finalMetrics.loss[lastEpoch];
    const valLoss = finalMetrics.val_loss[lastEpoch];
    const valAcc = finalMetrics.val_binaryAccuracy?.[lastEpoch] || finalMetrics.val_acc?.[lastEpoch];
    console.log(`\n📊 Final Training Metrics:`);
    console.log(`Training Loss: ${trainLoss.toFixed(4)}`);
    console.log(`Validation Loss: ${valLoss.toFixed(4)}`);
    console.log(`Validation Binary Accuracy: ${valAcc?.toFixed(4) || 'N/A'}`);
    if (valLoss > trainLoss * 2) {
        console.log('⚠️  Warning: Model might be overfitting');
    }
    if (valAcc && valAcc < 0.3) {
        console.log('⚠️  Warning: Low validation accuracy');
    }
}
//# sourceMappingURL=evaluation.js.map