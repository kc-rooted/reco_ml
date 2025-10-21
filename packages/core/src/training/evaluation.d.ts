import * as tf from '@tensorflow/tfjs-node';
import { UserAnswers, ShaftRecommendation } from '../types';
export declare function makePrediction(model: tf.Sequential, userAnswers: UserAnswers): Promise<number[]>;
export declare function getTopRecommendations(probabilities: number[], topN?: number): ShaftRecommendation[];
export declare function testKnownPatterns(model: tf.Sequential): Promise<void>;
export declare function evaluateMetrics(history: tf.History): void;
//# sourceMappingURL=evaluation.d.ts.map