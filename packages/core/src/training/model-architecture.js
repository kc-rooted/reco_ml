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
exports.DEFAULT_MODEL_CONFIG = void 0;
exports.createModel = createModel;
exports.compileModel = compileModel;
const tf = __importStar(require("@tensorflow/tfjs-node"));
const shaft_mappings_1 = require("../inference/shaft-mappings");
exports.DEFAULT_MODEL_CONFIG = {
    inputFeatures: 5,
    hiddenUnits: [32, 16],
    outputUnits: shaft_mappings_1.SHAFT_NAMES.length,
    dropoutRate: 0.3,
    learningRate: 0.001
};
function createModel(config = exports.DEFAULT_MODEL_CONFIG) {
    const model = tf.sequential();
    model.add(tf.layers.dense({
        inputShape: [config.inputFeatures],
        units: config.hiddenUnits[0],
        activation: 'tanh',
        name: 'input_layer'
    }));
    model.add(tf.layers.dropout({
        rate: config.dropoutRate,
        name: 'dropout_1'
    }));
    for (let i = 1; i < config.hiddenUnits.length; i++) {
        model.add(tf.layers.dense({
            units: config.hiddenUnits[i],
            activation: 'relu',
            name: `hidden_layer_${i}`
        }));
    }
    model.add(tf.layers.dense({
        units: config.outputUnits,
        activation: 'sigmoid',
        name: 'output_layer'
    }));
    return model;
}
function compileModel(model, learningRate = 0.001) {
    model.compile({
        optimizer: tf.train.adam(learningRate),
        loss: 'binaryCrossentropy',
        metrics: ['binaryAccuracy']
    });
}
//# sourceMappingURL=model-architecture.js.map