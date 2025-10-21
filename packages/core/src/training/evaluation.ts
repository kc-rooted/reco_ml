import * as tf from '@tensorflow/tfjs-node';
import { UserAnswers, ShaftRecommendation } from '../types';
import { SHAFT_NAMES } from '../inference/shaft-mappings';
import { 
  encodeSwingSpeed, 
  encodeCurrentShotShape 
} from './data-preprocessing';

export async function makePrediction(
  model: tf.Sequential, 
  userAnswers: UserAnswers
): Promise<number[]> {
  const input = [
    encodeSwingSpeed(userAnswers.swing_speed),
    encodeCurrentShotShape(userAnswers.current_shot_shape),
    userAnswers.shot_shape_slider,
    userAnswers.trajectory_slider,
    userAnswers.feel_slider
  ];
  
  const inputTensor = tf.tensor2d([input]);
  const prediction = model.predict(inputTensor) as tf.Tensor;
  const probabilities = await prediction.data();
  
  inputTensor.dispose();
  prediction.dispose();
  
  return Array.from(probabilities);
}

export function getTopRecommendations(
  probabilities: number[], 
  topN: number = 2
): ShaftRecommendation[] {
  const indexedProbs = probabilities.map((prob, index) => ({
    index,
    probability: prob,
    name: SHAFT_NAMES[index],
    percentage: Math.round(prob * 100)
  }));
  
  const sorted = indexedProbs.sort((a, b) => b.probability - a.probability);
  return sorted.slice(0, topN);
}

export async function testKnownPatterns(model: tf.Sequential): Promise<void> {
  const testCases = [
    {
      name: "Slow swing + fade preference",
      input: {
        swing_speed: 'under85',
        current_shot_shape: 'fade',
        shot_shape_slider: 0.8,
        trajectory_slider: 0.5,
        feel_slider: 0.2
      },
      expectedFamily: 'Red'
    },
    {
      name: "Fast swing + draw preference",
      input: {
        swing_speed: 'over115',
        current_shot_shape: 'draw', 
        shot_shape_slider: -0.8,
        trajectory_slider: -0.3,
        feel_slider: -0.5
      },
      expectedFamily: 'Green'
    },
    {
      name: "Medium swing + neutral",
      input: {
        swing_speed: '96-105',
        current_shot_shape: 'straight',
        shot_shape_slider: 0.1,
        trajectory_slider: 0.0,
        feel_slider: 0.3
      },
      expectedFamily: 'Blue'
    }
  ];
  
  console.log('\n🧪 Testing Model with Known Patterns:');
  console.log('=====================================');
  
  for (const testCase of testCases) {
    const probabilities = await makePrediction(model, testCase.input);
    const recommendations = getTopRecommendations(probabilities, 2);
    
    console.log(`\nTest: ${testCase.name}`);
    console.log(`Expected: ${testCase.expectedFamily} series shaft`);
    console.log(`Top recommendations:`);
    console.log(`  1. ${recommendations[0].name} (${recommendations[0].percentage}%)`);
    console.log(`  2. ${recommendations[1].name} (${recommendations[1].percentage}%)`);
    
    const isCorrectFamily = recommendations[0].name.includes(testCase.expectedFamily);
    console.log(`✅ Correct family: ${isCorrectFamily ? 'YES' : 'NO'}`);
  }
}

export function evaluateMetrics(history: tf.History): void {
  const finalMetrics = history.history;
  const lastEpoch = finalMetrics.loss.length - 1;
  
  const trainLoss = finalMetrics.loss[lastEpoch] as number;
  const valLoss = finalMetrics.val_loss[lastEpoch] as number;
  const valAcc = finalMetrics.val_binaryAccuracy?.[lastEpoch] as number || finalMetrics.val_acc?.[lastEpoch] as number;
  
  console.log(`\n📊 Final Training Metrics:`);
  console.log(`Training Loss: ${trainLoss.toFixed(4)}`);
  console.log(`Validation Loss: ${valLoss.toFixed(4)}`);
  console.log(`Validation Binary Accuracy: ${valAcc?.toFixed(4) || 'N/A'}`);
  
  if (valLoss > trainLoss * 2) {
    console.log('⚠️  Warning: Model might be overfitting');
  }
  
  if (valAcc && valAcc < 0.3) {
    console.log('⚠️  Warning: Low validation accuracy');
  }
}