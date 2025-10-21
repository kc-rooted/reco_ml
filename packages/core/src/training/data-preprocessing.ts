import * as tf from '@tensorflow/tfjs-node';
import { TrainingRecord } from '../types';
import { 
  SHAFT_INDEX, 
  SHAFT_NAMES,
  SWING_SPEED_MAPPING,
  SHOT_SHAPE_MAPPING
} from '../inference/shaft-mappings';

export function encodeSwingSpeed(speed: string): number {
  return SWING_SPEED_MAPPING[speed as keyof typeof SWING_SPEED_MAPPING] ?? 2;
}

export function encodeCurrentShotShape(shape: string): number {
  return SHOT_SHAPE_MAPPING[shape as keyof typeof SHOT_SHAPE_MAPPING] ?? 2;
}

export function createTargetDistribution(
  shaft1Name: string, 
  shaft2Name: string,
  prob1: number = 0.6,
  prob2: number = 0.35
): number[] {
  const target = new Array(SHAFT_NAMES.length).fill(0);
  
  const shaft1Index = SHAFT_INDEX[shaft1Name];
  const shaft2Index = SHAFT_INDEX[shaft2Name];
  
  if (shaft1Index !== undefined) {
    target[shaft1Index] = 1;
  }
  
  if (shaft2Index !== undefined) {
    target[shaft2Index] = 1;
  }
  
  return target;
}

export function preprocessTrainingData(
  rawData: TrainingRecord[]
): { inputTensor: tf.Tensor2D; outputTensor: tf.Tensor2D } {
  const inputs: number[][] = [];
  const outputs: number[][] = [];
  
  for (const record of rawData) {
    const input = [
      encodeSwingSpeed(record.swing_speed),
      encodeCurrentShotShape(record.current_shot_shape),
      record.shot_shape_slider,
      record.trajectory_slider,
      record.feel_slider
    ];
    
    const targetDistribution = createTargetDistribution(
      record.recommended_shaft_1,
      record.recommended_shaft_2,
      record.success_probability_1 || 0.6,
      record.success_probability_2 || 0.35
    );
    
    inputs.push(input);
    outputs.push(targetDistribution);
  }
  
  const inputTensor = tf.tensor2d(inputs);
  const outputTensor = tf.tensor2d(outputs);
  
  return { inputTensor, outputTensor };
}

export function normalizeSliderValues(value: number): number {
  return Math.max(-1, Math.min(1, value));
}