import * as tf from '@tensorflow/tfjs-node';
import { ModelConfig } from '../types';
import { SHAFT_NAMES } from '../inference/shaft-mappings';

export const DEFAULT_MODEL_CONFIG: ModelConfig = {
  inputFeatures: 5,
  hiddenUnits: [32, 16],
  outputUnits: SHAFT_NAMES.length,
  dropoutRate: 0.3,
  learningRate: 0.001
};

export function createModel(config: ModelConfig = DEFAULT_MODEL_CONFIG): tf.Sequential {
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

export function compileModel(model: tf.Sequential, learningRate: number = 0.001): void {
  model.compile({
    optimizer: tf.train.adam(learningRate),
    loss: 'binaryCrossentropy',
    metrics: ['binaryAccuracy']
  });
}