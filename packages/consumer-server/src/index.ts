import express from 'express';
import cors from 'cors';
import * as tf from '@tensorflow/tfjs-node';
import { v4 as uuidv4 } from 'uuid';
import {
  UserAnswers,
  makePrediction,
  getTopRecommendations,
  SHAFT_NAMES,
  getLatestModelPath
} from '@gears/core';
import { BigQueryService, UserDetails } from './services/bigquery';

const app = express();
app.use(cors());
app.use(express.json());

const bigQueryService = new BigQueryService();
let currentModel: tf.Sequential | null = null;

// Load the latest trained model on startup
async function loadModel() {
  try {
    const modelPath = getLatestModelPath();
    currentModel = await tf.loadLayersModel(modelPath) as tf.Sequential;
    console.log(`✅ Model loaded from: ${modelPath}`);
  } catch (error) {
    console.error('❌ Error loading model:', error);
    console.log('⚠️  Server will start but predictions will fail until model is available');
  }
}

// Initialize BigQuery table
async function initializeBigQuery() {
  try {
    await bigQueryService.initializeTable();
    console.log('✅ BigQuery initialized');
  } catch (error) {
    console.error('⚠️  BigQuery initialization failed:', error);
    console.log('   Server will continue but submissions will fail');
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    model: currentModel ? 'loaded' : 'not loaded',
    timestamp: new Date().toISOString()
  });
});

// Prediction endpoint
app.post('/api/predict', async (req, res) => {
  try {
    if (!currentModel) {
      return res.status(503).json({
        error: 'Model not loaded yet. Please try again in a moment.'
      });
    }

    const { userAnswers } = req.body as { userAnswers: UserAnswers };

    if (!userAnswers) {
      return res.status(400).json({ error: 'Missing userAnswers in request body' });
    }

    const probabilities = await makePrediction(currentModel, userAnswers);
    const recommendations = getTopRecommendations(probabilities, 3);

    // For consumer, we still calculate chartData but it won't be shown in UI
    // This is useful for debugging and potential future use
    const chartData = probabilities.map((prob, index) => ({
      shaft: SHAFT_NAMES[index],
      probability: Math.round(prob * 100),
      color: SHAFT_NAMES[index].includes('Red') ? '#f65d4a' :
             SHAFT_NAMES[index].includes('Green') ? '#0c8919' : '#9dc1d0'
    }));

    res.json({
      recommendations,
      chartData,
      allProbabilities: probabilities
    });
  } catch (error: any) {
    console.error('Prediction error:', error);
    res.status(500).json({ error: error.message || 'Failed to make prediction' });
  }
});

// Submit user details and save to BigQuery
app.post('/api/submit', async (req, res) => {
  try {
    const {
      userDetails,
      quizAnswers,
      recommendations,
      allProbabilities
    } = req.body as {
      userDetails: UserDetails;
      quizAnswers: UserAnswers;
      recommendations: any[];
      allProbabilities: number[];
    };

    // Validate required fields
    if (!userDetails || !quizAnswers || !recommendations) {
      return res.status(400).json({
        error: 'Missing required fields: userDetails, quizAnswers, recommendations'
      });
    }

    // Generate session ID
    const sessionId = uuidv4();

    // Save to BigQuery
    await bigQueryService.saveRecommendation(
      userDetails,
      quizAnswers,
      recommendations,
      allProbabilities || [],
      sessionId
    );

    res.json({
      success: true,
      sessionId,
      message: 'Your recommendation has been saved successfully!'
    });
  } catch (error: any) {
    console.error('Submission error:', error);
    res.status(500).json({
      error: error.message || 'Failed to save recommendation'
    });
  }
});

const PORT = process.env.PORT || 3002;

// Startup sequence
async function startServer() {
  await loadModel();
  await initializeBigQuery();

  app.listen(PORT, () => {
    console.log(`🚀 Consumer server running on http://localhost:${PORT}`);
  });
}

startServer();
