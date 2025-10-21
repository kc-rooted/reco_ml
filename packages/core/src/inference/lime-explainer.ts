import * as tf from '@tensorflow/tfjs-node';
import { UserAnswers } from '../types';
import {
  encodeSwingSpeed,
  encodeCurrentShotShape
} from '../training/data-preprocessing';
import { SWING_SPEED_MAPPING, SHOT_SHAPE_MAPPING } from './shaft-mappings';

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

const FEATURE_NAMES = [
  'Swing Speed',
  'Current Shot Shape',
  'Shot Shape Preference',
  'Trajectory Preference',
  'Feel Preference'
];

/**
 * LIME-inspired explanation for individual predictions
 * Perturbs each feature and measures impact on prediction for target shaft
 */
export async function explainPrediction(
  model: tf.Sequential,
  userAnswers: UserAnswers,
  targetShaftIndex: number,
  baseProbabilities: number[]
): Promise<ShaftExplanation> {
  const baseProbability = baseProbabilities[targetShaftIndex];
  const featureImportances: FeatureImportance[] = [];

  // Original input vector
  const baseInput = [
    encodeSwingSpeed(userAnswers.swing_speed),
    encodeCurrentShotShape(userAnswers.current_shot_shape),
    userAnswers.shot_shape_slider,
    userAnswers.trajectory_slider,
    userAnswers.feel_slider
  ];

  // 1. Perturb swing speed
  const swingSpeedImpact = await perturbSwingSpeed(
    model,
    userAnswers,
    targetShaftIndex,
    baseProbability
  );
  featureImportances.push({
    feature: FEATURE_NAMES[0],
    importance: Math.abs(swingSpeedImpact),
    direction: swingSpeedImpact >= 0 ? 'positive' : 'negative',
    baseValue: userAnswers.swing_speed
  });

  // 2. Perturb shot shape
  const shotShapeImpact = await perturbShotShape(
    model,
    userAnswers,
    targetShaftIndex,
    baseProbability
  );
  featureImportances.push({
    feature: FEATURE_NAMES[1],
    importance: Math.abs(shotShapeImpact),
    direction: shotShapeImpact >= 0 ? 'positive' : 'negative',
    baseValue: userAnswers.current_shot_shape
  });

  // 3. Perturb shot shape slider
  const shotShapeSliderImpact = await perturbSlider(
    model,
    userAnswers,
    'shot_shape_slider',
    targetShaftIndex,
    baseProbability
  );
  featureImportances.push({
    feature: FEATURE_NAMES[2],
    importance: Math.abs(shotShapeSliderImpact),
    direction: shotShapeSliderImpact >= 0 ? 'positive' : 'negative',
    baseValue: userAnswers.shot_shape_slider.toFixed(2)
  });

  // 4. Perturb trajectory slider
  const trajectorySliderImpact = await perturbSlider(
    model,
    userAnswers,
    'trajectory_slider',
    targetShaftIndex,
    baseProbability
  );
  featureImportances.push({
    feature: FEATURE_NAMES[3],
    importance: Math.abs(trajectorySliderImpact),
    direction: trajectorySliderImpact >= 0 ? 'positive' : 'negative',
    baseValue: userAnswers.trajectory_slider.toFixed(2)
  });

  // 5. Perturb feel slider
  const feelSliderImpact = await perturbSlider(
    model,
    userAnswers,
    'feel_slider',
    targetShaftIndex,
    baseProbability
  );
  featureImportances.push({
    feature: FEATURE_NAMES[4],
    importance: Math.abs(feelSliderImpact),
    direction: feelSliderImpact >= 0 ? 'positive' : 'negative',
    baseValue: userAnswers.feel_slider.toFixed(2)
  });

  // Normalize importances to percentages
  const totalImportance = featureImportances.reduce((sum, f) => sum + f.importance, 0);
  featureImportances.forEach(f => {
    f.importance = totalImportance > 0 ? (f.importance / totalImportance) * 100 : 0;
  });

  // Sort by importance descending
  featureImportances.sort((a, b) => b.importance - a.importance);

  return {
    shaftName: '', // Will be filled by caller
    shaftIndex: targetShaftIndex,
    probability: baseProbability,
    featureImportances
  };
}

async function perturbSwingSpeed(
  model: tf.Sequential,
  userAnswers: UserAnswers,
  targetShaftIndex: number,
  baseProbability: number
): Promise<number> {
  const swingSpeeds = Object.keys(SWING_SPEED_MAPPING);
  let totalDelta = 0;
  let count = 0;

  for (const speed of swingSpeeds) {
    if (speed === userAnswers.swing_speed) continue;

    const perturbedAnswers = { ...userAnswers, swing_speed: speed };
    const input = [
      encodeSwingSpeed(perturbedAnswers.swing_speed),
      encodeCurrentShotShape(perturbedAnswers.current_shot_shape),
      perturbedAnswers.shot_shape_slider,
      perturbedAnswers.trajectory_slider,
      perturbedAnswers.feel_slider
    ];

    const inputTensor = tf.tensor2d([input]);
    const prediction = model.predict(inputTensor) as tf.Tensor;
    const probabilities = await prediction.data();

    const delta = baseProbability - probabilities[targetShaftIndex];
    totalDelta += Math.abs(delta);
    count++;

    inputTensor.dispose();
    prediction.dispose();
  }

  return count > 0 ? totalDelta / count : 0;
}

async function perturbShotShape(
  model: tf.Sequential,
  userAnswers: UserAnswers,
  targetShaftIndex: number,
  baseProbability: number
): Promise<number> {
  const shotShapes = Object.keys(SHOT_SHAPE_MAPPING);
  let totalDelta = 0;
  let count = 0;

  for (const shape of shotShapes) {
    if (shape === userAnswers.current_shot_shape) continue;

    const perturbedAnswers = { ...userAnswers, current_shot_shape: shape };
    const input = [
      encodeSwingSpeed(perturbedAnswers.swing_speed),
      encodeCurrentShotShape(perturbedAnswers.current_shot_shape),
      perturbedAnswers.shot_shape_slider,
      perturbedAnswers.trajectory_slider,
      perturbedAnswers.feel_slider
    ];

    const inputTensor = tf.tensor2d([input]);
    const prediction = model.predict(inputTensor) as tf.Tensor;
    const probabilities = await prediction.data();

    const delta = baseProbability - probabilities[targetShaftIndex];
    totalDelta += Math.abs(delta);
    count++;

    inputTensor.dispose();
    prediction.dispose();
  }

  return count > 0 ? totalDelta / count : 0;
}

async function perturbSlider(
  model: tf.Sequential,
  userAnswers: UserAnswers,
  sliderName: 'shot_shape_slider' | 'trajectory_slider' | 'feel_slider',
  targetShaftIndex: number,
  baseProbability: number
): Promise<number> {
  // Perturb slider by ±0.5
  const perturbations = [
    userAnswers[sliderName] + 0.5,
    userAnswers[sliderName] - 0.5
  ].map(v => Math.max(-1, Math.min(1, v)));

  let totalDelta = 0;
  let count = 0;

  for (const perturbedValue of perturbations) {
    if (perturbedValue === userAnswers[sliderName]) continue;

    const perturbedAnswers = { ...userAnswers, [sliderName]: perturbedValue };
    const input = [
      encodeSwingSpeed(perturbedAnswers.swing_speed),
      encodeCurrentShotShape(perturbedAnswers.current_shot_shape),
      perturbedAnswers.shot_shape_slider,
      perturbedAnswers.trajectory_slider,
      perturbedAnswers.feel_slider
    ];

    const inputTensor = tf.tensor2d([input]);
    const prediction = model.predict(inputTensor) as tf.Tensor;
    const probabilities = await prediction.data();

    const delta = baseProbability - probabilities[targetShaftIndex];
    totalDelta += Math.abs(delta);
    count++;

    inputTensor.dispose();
    prediction.dispose();
  }

  return count > 0 ? totalDelta / count : 0;
}
