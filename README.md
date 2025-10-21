# Golf Shaft Recommendation ML - Monorepo

A TensorFlow.js-based machine learning system with separate admin and consumer interfaces for recommending golf shafts based on player characteristics.

## Architecture

This is a monorepo containing:
- **Admin Application**: Training interface, metrics, and model management
- **Consumer Application**: Public-facing shaft recommendation quiz with BigQuery data storage
- **Shared Core**: Reusable ML inference logic and types
- **Shared UI**: Reusable React components

## Monorepo Structure

```
packages/
├── core/                    # Shared ML logic (inference, training, types)
├── shared-ui/              # Shared React components (PredictionQuiz)
├── admin-server/           # Admin API (training, stats, predictions)
├── admin-client/           # Admin React app (port 5173)
├── consumer-server/        # Consumer API (predictions, BigQuery)
└── consumer-client/        # Consumer React app (port 5174)
```

## Features

### Admin Application
- **Interactive Training Interface**: Adjust hyperparameters and train models in real-time
- **Live Training Metrics**: Watch loss and accuracy metrics update during training via WebSockets
- **Model Testing**: Test predictions with different input parameters
- **Data Visualization**: View training data statistics and distributions
- **Real-time Charts**: Interactive charts using Recharts

### Consumer Application
- **Simplified Quiz**: Easy-to-use interface for golfers to find their perfect shaft
- **No Percentages Shown**: Clean UX without technical details
- **User Data Collection**: Collect name, shipping details, and handicap
- **BigQuery Storage**: Store all recommendations and user details for follow-up

## Tech Stack

- **Backend**: Node.js, Express, Socket.io (admin), TensorFlow.js, BigQuery
- **Frontend**: React, TypeScript, Recharts
- **Build Tools**: Vite, TypeScript, npm Workspaces

## Installation

Install all workspace dependencies:

```bash
npm install
```

## Running the Applications

### Admin Application (Training & Management)

Start both admin server and client:

```bash
npm run dev:admin
```

This will start:
- Admin server on http://localhost:3001
- Admin client on http://localhost:5173

### Consumer Application (Public Quiz)

Start both consumer server and client:

```bash
npm run dev:consumer
```

This will start:
- Consumer server on http://localhost:3002
- Consumer client on http://localhost:5174

### Environment Variables for Consumer Server

Create a `.env` file in `packages/consumer-server/`:

```env
GCP_PROJECT_ID=your-project-id
BQ_DATASET_ID=shaft_recommendations
BQ_TABLE_ID=consumer_submissions
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
```

### Production Build

```bash
# Build admin application
npm run build:admin

# Build consumer application
npm run build:consumer

# Build everything
npm run build
```

## Detailed Package Structure

```
packages/
├── core/                           # @gears/core
│   └── src/
│       ├── inference/             # Prediction logic (shared)
│       ├── training/              # Model training (admin only)
│       ├── types/                 # TypeScript interfaces (shared)
│       ├── utils/                 # Utilities (shared)
│       └── constants.ts           # Model paths, configs
│
├── shared-ui/                      # @gears/shared-ui
│   └── src/
│       └── components/
│           └── PredictionQuiz.tsx # Configurable quiz component
│
├── admin-server/                   # @gears/admin-server
│   └── src/
│       ├── routes/                # API routes
│       ├── middleware/            # Google Auth (future)
│       ├── training-controller.ts # Training orchestration
│       └── index.ts               # Server entry
│
├── admin-client/                   # @gears/admin-client
│   └── src/
│       ├── components/            # Training, Metrics, Stats UI
│       ├── hooks/                 # Socket.io hooks
│       └── App.tsx                # Admin app
│
├── consumer-server/                # @gears/consumer-server
│   └── src/
│       ├── routes/                # Predict & Submit endpoints
│       ├── services/
│       │   └── bigquery.ts        # BigQuery integration
│       └── index.ts               # Server entry
│
└── consumer-client/                # @gears/consumer-client
    └── src/
        ├── components/
        │   ├── UserDetailsForm.tsx # Shipping details form
        │   └── ThankYou.tsx        # Confirmation page
        └── App.tsx                 # Consumer app (multi-step)
```

## API Endpoints

### Admin Server (Port 3001)

- `POST /api/train` - Start model training with custom config
- `GET /api/model-info` - Get current model information
- `POST /api/predict` - Make predictions with trained model
- `GET /api/training-data-stats` - Get training data statistics

### Consumer Server (Port 3002)

- `GET /health` - Health check endpoint
- `POST /api/predict` - Make predictions (user quiz input)
- `POST /api/submit` - Submit user details and save to BigQuery

## WebSocket Events (Admin Only)

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

## Using the Consumer Interface

1. **Quiz Step**: Answer questions about swing characteristics
   - Swing speed, shot shape, preferences
   - Simple sliders for trajectory and feel

2. **Details Step**: Enter personal information
   - Name, email, phone
   - Shipping address
   - Optional handicap

3. **Confirmation**: Review and receive confirmation
   - See recommended shafts
   - Get reference ID for tracking

## Code Reuse Strategy

The monorepo maximizes code reuse:

- **Core Package**: Shared ML logic used by both admin and consumer servers
- **Shared UI**: PredictionQuiz component used by both clients with different configurations
- **Types**: Consistent TypeScript types across all packages
- **Model Path**: Both servers point to the same `models/latest/` directory

When admin trains a new model, consumer automatically uses it on next request.