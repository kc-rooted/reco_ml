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
exports.trainCompleteModel = trainCompleteModel;
exports.trainModel = trainModel;
exports.saveModel = saveModel;
const tf = __importStar(require("@tensorflow/tfjs-node"));
const path = __importStar(require("path"));
const csv_loader_1 = require("../utils/csv-loader");
const data_preprocessing_1 = require("./data-preprocessing");
const model_architecture_1 = require("./model-architecture");
const evaluation_1 = require("./evaluation");
const DEFAULT_TRAINING_CONFIG = {
    epochs: 100,
    batchSize: 32,
    validationSplit: 0.2,
    patience: 15
};
async function trainModel(model, inputTensor, outputTensor, config = DEFAULT_TRAINING_CONFIG) {
    (0, model_architecture_1.compileModel)(model, model_architecture_1.DEFAULT_MODEL_CONFIG.learningRate);
    const earlyStopping = tf.callbacks.earlyStopping({
        monitor: 'val_loss',
        patience: config.patience
    });
    const history = await model.fit(inputTensor, outputTensor, {
        epochs: config.epochs,
        batchSize: config.batchSize,
        validationSplit: config.validationSplit,
        shuffle: true,
        callbacks: [earlyStopping],
        verbose: 1
    });
    return history;
}
async function saveModel(model, modelPath = 'file://./models/v1') {
    await model.save(modelPath);
    console.log(`💾 Model saved to: ${modelPath}`);
}
async function trainCompleteModel(trainingData, modelSavePath) {
    console.log('🏌️ Starting Golf Shaft Model Training...');
    console.log('========================================');
    console.log('📊 Preprocessing training data...');
    const { inputTensor, outputTensor } = (0, data_preprocessing_1.preprocessTrainingData)(trainingData);
    console.log('🧠 Creating model architecture...');
    const model = (0, model_architecture_1.createModel)();
    console.log('\n📋 Model Architecture:');
    model.summary();
    console.log('\n🎯 Training model...');
    const history = await trainModel(model, inputTensor, outputTensor);
    (0, evaluation_1.evaluateMetrics)(history);
    console.log('\n🧪 Testing model...');
    await (0, evaluation_1.testKnownPatterns)(model);
    if (modelSavePath) {
        console.log('\n💾 Saving model...');
        await saveModel(model, modelSavePath);
    }
    inputTensor.dispose();
    outputTensor.dispose();
    console.log('\n✅ Training pipeline complete!');
    return model;
}
async function main() {
    try {
        const dataPath = path.join(process.cwd(), 'data', 'golf-shaft-data.csv');
        console.log(`Loading data from: ${dataPath}`);
        const trainingData = (0, csv_loader_1.loadCSVData)(dataPath);
        if (!(0, csv_loader_1.validateTrainingData)(trainingData)) {
            throw new Error('Invalid training data');
        }
        const model = await trainCompleteModel(trainingData, 'file://./models/v1');
        console.log('\n🎉 All done! Model is ready for production use.');
    }
    catch (error) {
        console.error('❌ Error during training:', error);
        process.exit(1);
    }
}
if (require.main === module) {
    main();
}
//# sourceMappingURL=train-model.js.map