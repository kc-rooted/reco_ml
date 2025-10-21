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
exports.loadModel = loadModel;
exports.loadTFModel = loadModel;
exports.getShaftRecommendations = getShaftRecommendations;
exports.predictFromCLI = predictFromCLI;
const tf = __importStar(require("@tensorflow/tfjs-node"));
const evaluation_1 = require("../training/evaluation");
async function loadModel(modelPath) {
    const model = await tf.loadLayersModel(modelPath);
    console.log(`📂 Model loaded from: ${modelPath}`);
    return model;
}
async function getShaftRecommendations(userAnswers, modelPath = 'file://./models/v1/model.json') {
    const model = await loadModel(modelPath);
    const probabilities = await (0, evaluation_1.makePrediction)(model, userAnswers);
    const recommendations = (0, evaluation_1.getTopRecommendations)(probabilities, 2);
    return {
        recommendations,
        allProbabilities: probabilities
    };
}
async function predictFromCLI() {
    const args = process.argv.slice(2);
    if (args.length < 5) {
        console.log('Usage: npm run predict <swing_speed> <shot_shape> <shape_slider> <trajectory_slider> <feel_slider>');
        console.log('Example: npm run predict 96-105 draw -0.6 0.2 0.4');
        process.exit(1);
    }
    const userAnswers = {
        swing_speed: args[0],
        current_shot_shape: args[1],
        shot_shape_slider: parseFloat(args[2]),
        trajectory_slider: parseFloat(args[3]),
        feel_slider: parseFloat(args[4])
    };
    try {
        const { recommendations } = await getShaftRecommendations(userAnswers);
        console.log('\n🎯 Shaft Recommendations:');
        console.log('========================');
        console.log(`User Profile: ${userAnswers.swing_speed} mph, ${userAnswers.current_shot_shape} bias`);
        console.log('\nTop Recommendations:');
        recommendations.forEach((rec, index) => {
            console.log(`  ${index + 1}. ${rec.name} (${rec.percentage}% confidence)`);
        });
    }
    catch (error) {
        console.error('Error making prediction:', error);
        process.exit(1);
    }
}
if (require.main === module) {
    predictFromCLI();
}
//# sourceMappingURL=predict.js.map