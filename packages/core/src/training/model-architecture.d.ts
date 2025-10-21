import * as tf from '@tensorflow/tfjs-node';
import { ModelConfig } from '../types';
export declare const DEFAULT_MODEL_CONFIG: ModelConfig;
export declare function createModel(config?: ModelConfig): tf.Sequential;
export declare function compileModel(model: tf.Sequential, learningRate?: number): void;
//# sourceMappingURL=model-architecture.d.ts.map