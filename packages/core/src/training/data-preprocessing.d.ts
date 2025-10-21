import * as tf from '@tensorflow/tfjs-node';
import { TrainingRecord } from '../types';
export declare function encodeSwingSpeed(speed: string): number;
export declare function encodeCurrentShotShape(shape: string): number;
export declare function createTargetDistribution(shaft1Name: string, shaft2Name: string, prob1?: number, prob2?: number): number[];
export declare function preprocessTrainingData(rawData: TrainingRecord[]): {
    inputTensor: tf.Tensor2D;
    outputTensor: tf.Tensor2D;
};
export declare function normalizeSliderValues(value: number): number;
//# sourceMappingURL=data-preprocessing.d.ts.map