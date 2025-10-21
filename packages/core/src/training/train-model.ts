import * as tf from '@tensorflow/tfjs-node';
import * as path from 'path';
import { TrainingConfig, TrainingRecord } from '../types';
import { loadCSVData, validateTrainingData } from '../utils/csv-loader';
import { preprocessTrainingData } from './data-preprocessing';
import { createModel, compileModel, DEFAULT_MODEL_CONFIG } from './model-architecture';
import { testKnownPatterns, evaluateMetrics } from './evaluation';

const DEFAULT_TRAINING_CONFIG: TrainingConfig = {
  epochs: 100,
  batchSize: 32,
  validationSplit: 0.2,
  patience: 15
};

async function trainModel(
  model: tf.Sequential, 
  inputTensor: tf.Tensor2D, 
  outputTensor: tf.Tensor2D,
  config: TrainingConfig = DEFAULT_TRAINING_CONFIG
): Promise<tf.History> {
  
  compileModel(model, DEFAULT_MODEL_CONFIG.learningRate);
  
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

async function saveModel(
  model: tf.Sequential, 
  modelPath: string = 'file://./models/v1'
): Promise<void> {
  await model.save(modelPath);
  console.log(`💾 Model saved to: ${modelPath}`);
}

export async function trainCompleteModel(
  trainingData: TrainingRecord[],
  modelSavePath?: string
): Promise<tf.Sequential> {
  console.log('🏌️ Starting Golf Shaft Model Training...');
  console.log('========================================');
  
  console.log('📊 Preprocessing training data...');
  const { inputTensor, outputTensor } = preprocessTrainingData(trainingData);
  
  console.log('🧠 Creating model architecture...');
  const model = createModel();
  
  console.log('\n📋 Model Architecture:');
  model.summary();
  
  console.log('\n🎯 Training model...');
  const history = await trainModel(model, inputTensor, outputTensor);
  
  evaluateMetrics(history);
  
  console.log('\n🧪 Testing model...');
  await testKnownPatterns(model);
  
  if (modelSavePath) {
    console.log('\n💾 Saving model...');
    await saveModel(model, modelSavePath);
  }
  
  inputTensor.dispose();
  outputTensor.dispose();
  
  console.log('\n✅ Training pipeline complete!');
  return model;
}

async function main(): Promise<void> {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'golf-shaft-data.csv');
    console.log(`Loading data from: ${dataPath}`);
    
    const trainingData = loadCSVData(dataPath);
    
    if (!validateTrainingData(trainingData)) {
      throw new Error('Invalid training data');
    }
    
    const model = await trainCompleteModel(trainingData, 'file://./models/v1');
    
    console.log('\n🎉 All done! Model is ready for production use.');
    
  } catch (error) {
    console.error('❌ Error during training:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { trainModel, saveModel };