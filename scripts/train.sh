#!/bin/bash

echo "🏌️ Starting Golf Shaft Model Training..."
echo "========================================"

npm install

npm run build

node dist/training/train-model.js

echo "✅ Training complete!"