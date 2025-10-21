import * as tf from '@tensorflow/tfjs-node';
import { UserAnswers, ShaftRecommendation } from '../types';
export declare function loadModel(modelPath: string): Promise<tf.Sequential>;
export declare function getShaftRecommendations(userAnswers: UserAnswers, modelPath?: string): Promise<{
    recommendations: ShaftRecommendation[];
    allProbabilities: number[];
}>;
export declare function predictFromCLI(): Promise<void>;
export { loadModel as loadTFModel };
//# sourceMappingURL=predict.d.ts.map