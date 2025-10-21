// MUST BE FIRST: Patch util module before any TensorFlow.js imports
import './util-patch';

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import * as path from 'path';
import { TrainingController } from './training-controller';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

const trainingController = new TrainingController(io);

app.post('/api/train', async (req, res) => {
  try {
    const config = req.body;
    const modelPath = await trainingController.startTraining(config);
    res.json({ success: true, modelPath });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/model-info', async (req, res) => {
  try {
    const info = await trainingController.getModelInfo();
    res.json(info);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/predict', async (req, res) => {
  try {
    const { userAnswers } = req.body;
    const predictions = await trainingController.makePrediction(userAnswers);
    res.json(predictions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/training-data-stats', async (req, res) => {
  try {
    const stats = await trainingController.getDataStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});