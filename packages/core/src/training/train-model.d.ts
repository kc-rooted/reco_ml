import * as tf from '@tensorflow/tfjs-node';
import { TrainingConfig, TrainingRecord } from '../types';
declare function trainModel(model: tf.Sequential, inputTensor: tf.Tensor2D, outputTensor: tf.Tensor2D, config?: TrainingConfig): Promise<tf.History>;
declare function saveModel(model: tf.Sequential, modelPath?: string): Promise<void>;
export declare function trainCompleteModel(trainingData: TrainingRecord[], modelSavePath?: string): Promise<tf.Sequential>;
export { trainModel, saveModel };
//# sourceMappingURL=train-model.d.ts.map