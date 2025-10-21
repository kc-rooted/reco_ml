# Golf Shaft Recommendation ML Admin

A TensorFlow.js-based machine learning model with React admin interface for recommending golf shafts based on player characteristics.

## Features

- **Interactive Training Interface**: Adjust hyperparameters and train models in real-time
- **Live Training Metrics**: Watch loss and accuracy metrics update during training via WebSockets
- **Model Testing**: Test predictions with different input parameters
- **Data Visualization**: View training data statistics and distributions
- **Real-time Charts**: Interactive charts using Recharts

## Tech Stack

- **Backend**: Node.js, Express, Socket.io, TensorFlow.js
- **Frontend**: React, TypeScript, Material-UI, Recharts
- **Build Tools**: Vite, TypeScript

## Installation

```bash
npm install
```

## Running the Application

### Development Mode (Recommended)

Start both server and client in development mode:

```bash
npm start
```

This will:
- Start the Express server on http://localhost:3001
- Start the React client on http://localhost:5173

### Production Build

```bash
# Build TypeScript
npm run build

# Build client
npm run client:build

# Start server
npm run server
```

## Project Structure

```
├── src/
│   ├── training/         # Model training logic
│   ├── inference/        # Prediction logic
│   ├── server/           # Express API & WebSocket server
│   └── types/            # TypeScript interfaces
├── client/
│   └── src/
│       ├── components/   # React components
│       ├── hooks/        # Custom React hooks
│       └── App.tsx       # Main app component
└── data/
    └── golf-shaft-data.csv  # Training data
```

## API Endpoints

- `POST /api/train` - Start model training with custom config
- `GET /api/model-info` - Get current model information
- `POST /api/predict` - Make predictions with trained model
- `GET /api/training-data-stats` - Get training data statistics

## WebSocket Events

- `training:started` - Training has begun
- `training:epoch` - Epoch completed with metrics
- `training:completed` - Training finished
- `training:error` - Training error occurred

## Using the Admin Interface

1. **Training Tab**: Adjust model parameters and start training
   - Epochs, batch size, learning rate
   - Network architecture (hidden units, dropout)
   - Early stopping patience

2. **Metrics Tab**: View detailed training metrics
   - Loss and accuracy charts
   - Real-time updates during training

3. **Test Predictions Tab**: Test the model
   - Input swing speed, shot shape, and preferences
   - See top recommendations with confidence scores
   - View probability distribution across all shafts

4. **Data Statistics Tab**: Analyze training data
   - Swing speed distribution
   - Shot shape distribution
   - Shaft recommendation frequency