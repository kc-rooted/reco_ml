// MUST BE FIRST: Patch util module before TensorFlow.js import
import './util-patch';

import * as tf from '@tensorflow/tfjs-node';
import { Server } from 'socket.io';
import * as path from 'path';
import {
  TrainingRecord,
  UserAnswers,
  TrainingConfig,
  ModelConfig,
  loadCSVData,
  validateTrainingData,
  preprocessTrainingData,
  createModel,
  compileModel,
  makePrediction,
  getTopRecommendations,
  SHAFT_NAMES,
  explainPrediction,
  ShaftExplanation
} from '@gears/core';

export class TrainingController {
  private io: Server;
  private currentModel: tf.Sequential | null = null;
  private trainingData: TrainingRecord[] = [];
  private isTraining: boolean = false;
  private trainingHistory: any[] = [];

  constructor(io: Server) {
    this.io = io;
    this.loadTrainingData();
    this.loadExistingModel();
  }

  private async loadTrainingData() {
    // Data is in monorepo root, go up two levels from packages/admin-server
    const dataPath = path.join(process.cwd(), '..', '..', 'data', 'golf-shaft-data.csv');
    this.trainingData = loadCSVData(dataPath);
    validateTrainingData(this.trainingData);
  }

  private async loadExistingModel() {
    try {
      // Models are in monorepo root, go up two levels from packages/admin-server
      const modelPath = 'file://../../models/latest';
      this.currentModel = await tf.loadLayersModel(`${modelPath}/model.json`) as tf.Sequential;
      console.log('✅ Loaded existing trained model from', modelPath);

      // Load training history if it exists
      const historyPath = path.join(process.cwd(), '..', '..', 'models', 'latest', 'history.json');
      try {
        const fs = await import('fs');
        if (fs.existsSync(historyPath)) {
          const historyData = fs.readFileSync(historyPath, 'utf8');
          this.trainingHistory = JSON.parse(historyData);
          console.log(`📊 Loaded training history: ${this.trainingHistory.length} epochs`);
        }
      } catch (historyError) {
        console.log('📝 No training history found, starting fresh');
      }
    } catch (error) {
      console.log('🔄 No existing model found, will need to train a new one');
    }
  }

  async startTraining(config: {
    modelConfig?: Partial<ModelConfig>;
    trainingConfig?: Partial<TrainingConfig>;
  }): Promise<string> {
    if (this.isTraining) {
      throw new Error('Training already in progress');
    }

    this.isTraining = true;
    this.trainingHistory = [];

    const modelConfig: ModelConfig = {
      inputFeatures: 5,
      hiddenUnits: config.modelConfig?.hiddenUnits || [32, 16],
      outputUnits: SHAFT_NAMES.length,
      dropoutRate: config.modelConfig?.dropoutRate || 0.3,
      learningRate: config.modelConfig?.learningRate || 0.001
    };

    const trainingConfig: TrainingConfig = {
      epochs: config.trainingConfig?.epochs || 100,
      batchSize: config.trainingConfig?.batchSize || 32,
      validationSplit: config.trainingConfig?.validationSplit || 0.2,
      patience: config.trainingConfig?.patience || 15
    };

    try {
      this.io.emit('training:started', { modelConfig, trainingConfig });

      const { inputTensor, outputTensor } = preprocessTrainingData(this.trainingData);
      
      this.currentModel = createModel(modelConfig);
      compileModel(this.currentModel, modelConfig.learningRate);

      const earlyStopping = tf.callbacks.earlyStopping({
        monitor: 'val_loss',
        patience: trainingConfig.patience
      });

      // Training with proper error handling
      let history;
      try {
        history = await this.currentModel.fit(inputTensor, outputTensor, {
          epochs: trainingConfig.epochs,
          batchSize: trainingConfig.batchSize,
          validationSplit: trainingConfig.validationSplit,
          shuffle: true,
          callbacks: [earlyStopping],
          verbose: 1
        });

        console.log('✅ Training completed successfully');
      } catch (error) {
        console.error('❌ Training error:', error);
        this.isTraining = false;
        this.io.emit('training:error', { error: (error as Error).message });
        throw error;
      }

      // Process training history after completion
      const epochs = history.history.loss.length;
      this.trainingHistory = [];
      
      for (let i = 0; i < epochs; i++) {
        const epochData = {
          epoch: i + 1,
          loss: history.history.loss[i] as number,
          val_loss: history.history.val_loss[i] as number,
          binaryAccuracy: history.history.binaryAccuracy?.[i] as number,
          val_binaryAccuracy: history.history.val_binaryAccuracy?.[i] as number,
          accuracy: history.history.acc?.[i] as number,
          val_accuracy: history.history.val_acc?.[i] as number,
          timestamp: Date.now()
        };
        this.trainingHistory.push(epochData);
      }

      console.log(`📊 Training history processed: ${epochs} epochs`);

      // Emit completion with all history
      this.io.emit('training:completed', {
        history: this.trainingHistory,
        modelSummary: this.getModelSummary()
      });

      console.log('📡 Training completion event sent to clients');

      // Save model to monorepo root (go up two levels)
      const modelPath = 'file://../../models/latest';
      await this.currentModel.save(modelPath);

      // Save training history
      try {
        const fs = await import('fs');
        const historyPath = path.join(process.cwd(), '..', '..', 'models', 'latest', 'history.json');
        fs.writeFileSync(historyPath, JSON.stringify(this.trainingHistory, null, 2));
        console.log('💾 Training history saved to', historyPath);
      } catch (error) {
        console.warn('⚠️ Could not save training history:', error);
      }

      inputTensor.dispose();
      outputTensor.dispose();

      this.isTraining = false;
      return modelPath;
    } catch (error) {
      this.isTraining = false;
      this.io.emit('training:error', { error: (error as Error).message });
      throw error;
    }
  }

  async makePrediction(userAnswers: UserAnswers) {
    if (!this.currentModel) {
      throw new Error('No model loaded. Please train a model first.');
    }

    const probabilities = await makePrediction(this.currentModel, userAnswers);
    const recommendations = getTopRecommendations(probabilities, 3);

    // Generate LIME explanations for top 2 recommendations
    const explanations: ShaftExplanation[] = [];
    for (let i = 0; i < Math.min(2, recommendations.length); i++) {
      const rec = recommendations[i];
      const explanation = await explainPrediction(
        this.currentModel,
        userAnswers,
        rec.index,
        probabilities
      );
      explanation.shaftName = rec.name;
      explanations.push(explanation);
    }

    return {
      recommendations,
      explanations,
      allProbabilities: probabilities,
      chartData: probabilities.map((prob, index) => ({
        shaft: SHAFT_NAMES[index],
        probability: Math.round(prob * 100),
        color: SHAFT_NAMES[index].includes('Red') ? '#f65d4a' :
               SHAFT_NAMES[index].includes('Green') ? '#0c8919' : '#9dc1d0'
      }))
    };
  }

  async getModelInfo() {
    return {
      hasModel: !!this.currentModel,
      summary: this.currentModel ? this.getModelSummary() : null,
      trainingHistory: this.trainingHistory,
      isTraining: this.isTraining,
      lastTrainingCompleted: this.trainingHistory.length > 0 ? this.trainingHistory[this.trainingHistory.length - 1].timestamp : null
    };
  }

  async getDataStats() {
    const stats = {
      totalRecords: this.trainingData.length,
      swingSpeedDistribution: this.getDistribution('swing_speed'),
      shotShapeDistribution: this.getDistribution('current_shot_shape'),
      shaftRecommendationCounts: this.getShaftCounts(),
      colorSeriesDistribution: this.getDistribution('color_series')
    };

    return stats;
  }

  private getModelSummary() {
    if (!this.currentModel) return null;

    const layers = this.currentModel.layers.map(layer => ({
      name: layer.name,
      type: layer.getClassName(),
      outputShape: layer.outputShape,
      parameters: layer.countParams()
    }));

    return {
      layers,
      totalParameters: this.currentModel.countParams()
    };
  }

  private getDistribution(field: keyof TrainingRecord) {
    const counts: { [key: string]: number } = {};
    this.trainingData.forEach(record => {
      const value = String(record[field]);
      counts[value] = (counts[value] || 0) + 1;
    });
    return counts;
  }

  private getShaftCounts() {
    const counts: { [key: string]: number } = {};
    this.trainingData.forEach(record => {
      counts[record.recommended_shaft_1] = (counts[record.recommended_shaft_1] || 0) + 1;
      counts[record.recommended_shaft_2] = (counts[record.recommended_shaft_2] || 0) + 1;
    });
    return counts;
  }
}