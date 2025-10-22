import './util-patch'; // Must be first to fix TensorFlow.js util issue
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

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
import { EmailService, DriverDetails, ShaftRecommendation } from './services/email';

const app = express();
app.use(cors());
app.use(express.json());

const bigQueryService = new BigQueryService();
const emailService = new EmailService();
let currentModel: tf.Sequential | null = null;

// Load the latest trained model on startup
async function loadModel() {
  try {
    // Models are in monorepo root, go up two levels from packages/consumer-server
    const modelPath = 'file://../../models/latest/model.json';
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
    const recommendations = getTopRecommendations(probabilities, 2);

    // For consumer, we still calculate chartData but it won't be shown in UI
    // This is useful for debugging and potential future use
    const chartData = probabilities.map((prob: number, index: number) => ({
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
      driverDetails,
      quizAnswers,
      recommendations,
      allProbabilities
    } = req.body as {
      userDetails: UserDetails;
      driverDetails: DriverDetails;
      quizAnswers: UserAnswers;
      recommendations: ShaftRecommendation[];
      allProbabilities: number[];
    };

    // Validate required fields
    if (!userDetails || !driverDetails || !quizAnswers || !recommendations) {
      return res.status(400).json({
        error: 'Missing required fields: userDetails, driverDetails, quizAnswers, recommendations'
      });
    }

    let customerId, recommendationId, orderId;
    let bigQueryError = null;
    let emailError = null;

    // Try to save to BigQuery (don't fail the whole request if this fails)
    try {
      const result = await bigQueryService.saveRecommendation(
        userDetails,
        driverDetails,
        quizAnswers,
        recommendations,
        allProbabilities || [],
        undefined // LIME explanations (not generated in consumer flow yet)
      );
      customerId = result.customerId;
      recommendationId = result.recommendationId;
      orderId = result.orderId;
    } catch (error: any) {
      console.error('⚠️  BigQuery save failed, but continuing with email:', error.message);
      bigQueryError = error.message;
    }

    // Always try to send notification email, even if BigQuery failed
    try {
      await emailService.sendNotification(
        userDetails,
        driverDetails,
        quizAnswers,
        recommendations
      );
    } catch (error: any) {
      console.error('⚠️  Email notification failed:', error.message);
      emailError = error.message;
    }

    // Return success if at least email sent, or partial success
    if (emailError && bigQueryError) {
      return res.status(500).json({
        error: 'Both BigQuery and email failed',
        details: { bigQueryError, emailError }
      });
    }

    res.json({
      success: true,
      customerId,
      recommendationId,
      orderId,
      message: 'Your recommendation has been saved successfully!',
      warnings: {
        bigQuery: bigQueryError || undefined,
        email: emailError || undefined
      }
    });
  } catch (error: any) {
    console.error('Submission error:', error);
    res.status(500).json({
      error: error.message || 'Failed to save recommendation'
    });
  }
});

// Test email endpoint - sends sample email for design testing
app.post('/api/test-email', async (req, res) => {
  try {
    const testUserDetails: UserDetails = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '555-1234',
      shippingAddress: {
        street: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zip: '94102',
        country: 'USA'
      },
      handicap: 12
    };

    const testDriverDetails: DriverDetails = {
      brand: 'TaylorMade',
      model: 'Stealth 2',
      currentShaft: 'Project X 6.0',
      shaftSatisfaction: 7
    };

    const testQuizAnswers: UserAnswers = {
      swing_speed: '96-105',
      current_shot_shape: 'straight',
      shot_shape_slider: 0,
      trajectory_slider: 0.5,
      feel_slider: -0.3
    };

    const testRecommendations: ShaftRecommendation[] = [
      { name: 'Blue 65', percentage: 45 },
      { name: 'Red 75', percentage: 30 },
      { name: 'Green 55', percentage: 15 }
    ];

    await emailService.sendNotification(
      testUserDetails,
      testDriverDetails,
      testQuizAnswers,
      testRecommendations
    );

    res.json({
      success: true,
      message: 'Test email sent successfully!'
    });
  } catch (error: any) {
    console.error('Test email error:', error);
    res.status(500).json({
      error: error.message || 'Failed to send test email'
    });
  }
});

// Serve static files from React app (production only)
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../../consumer-client/dist');
  app.use(express.static(frontendPath));

  // Handle React routing - return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

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
