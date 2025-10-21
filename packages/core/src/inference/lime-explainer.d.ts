import * as tf from '@tensorflow/tfjs-node';
import { UserAnswers } from '../types';
export interface FeatureImportance {
    feature: string;
    importance: number;
    direction: 'positive' | 'negative';
    baseValue: string | number;
}
export interface ShaftExplanation {
    shaftName: string;
    shaftIndex: number;
    probability: number;
    featureImportances: FeatureImportance[];
}
/**
 * LIME-inspired explanation for individual predictions
 * Perturbs each feature and measures impact on prediction for target shaft
 */
export declare function explainPrediction(model: tf.Sequential, userAnswers: UserAnswers, targetShaftIndex: number, baseProbabilities: number[]): Promise<ShaftExplanation>;
//# sourceMappingURL=lime-explainer.d.ts.map