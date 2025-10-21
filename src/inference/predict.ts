import * as tf from '@tensorflow/tfjs-node';
import { UserAnswers, ShaftRecommendation } from '../types';
import { makePrediction, getTopRecommendations } from '../training/evaluation';

export async function loadModel(modelPath: string): Promise<tf.Sequential> {
  const model = await tf.loadLayersModel(modelPath) as tf.Sequential;
  console.log(`📂 Model loaded from: ${modelPath}`);
  return model;
}

export async function getShaftRecommendations(
  userAnswers: UserAnswers, 
  modelPath: string = 'file://./models/v1/model.json'
): Promise<{
  recommendations: ShaftRecommendation[];
  allProbabilities: number[];
}> {
  const model = await loadModel(modelPath);
  const probabilities = await makePrediction(model, userAnswers);
  const recommendations = getTopRecommendations(probabilities, 2);
  
  return {
    recommendations,
    allProbabilities: probabilities
  };
}

export async function predictFromCLI(): Promise<void> {
  const args = process.argv.slice(2);
  
  if (args.length < 5) {
    console.log('Usage: npm run predict <swing_speed> <shot_shape> <shape_slider> <trajectory_slider> <feel_slider>');
    console.log('Example: npm run predict 96-105 draw -0.6 0.2 0.4');
    process.exit(1);
  }
  
  const userAnswers: UserAnswers = {
    swing_speed: args[0],
    current_shot_shape: args[1],
    shot_shape_slider: parseFloat(args[2]),
    trajectory_slider: parseFloat(args[3]),
    feel_slider: parseFloat(args[4])
  };
  
  try {
    const { recommendations } = await getShaftRecommendations(userAnswers);
    
    console.log('\n🎯 Shaft Recommendations:');
    console.log('========================');
    console.log(`User Profile: ${userAnswers.swing_speed} mph, ${userAnswers.current_shot_shape} bias`);
    console.log('\nTop Recommendations:');
    recommendations.forEach((rec, index) => {
      console.log(`  ${index + 1}. ${rec.name} (${rec.percentage}% confidence)`);
    });
  } catch (error) {
    console.error('Error making prediction:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  predictFromCLI();
}

export { loadModel as loadTFModel };