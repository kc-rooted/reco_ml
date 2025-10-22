# Build stage
FROM node:18-slim AS builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy package files from monorepo root
COPY package*.json ./
COPY packages/consumer-server/package*.json ./packages/consumer-server/
COPY packages/consumer-client/package*.json ./packages/consumer-client/
COPY packages/core/package*.json ./packages/core/
COPY packages/shared-ui/package*.json ./packages/shared-ui/

# Install dependencies
RUN npm ci

# Copy source code and config files
COPY packages/consumer-server ./packages/consumer-server
COPY packages/consumer-client ./packages/consumer-client
COPY packages/core ./packages/core
COPY packages/shared-ui ./packages/shared-ui
COPY tsconfig.json ./
COPY tsconfig.base.json ./
COPY config ./config

# Build the packages
RUN npm run build -w @gears/core
RUN npm run build -w @gears/shared-ui
RUN npm run build -w @gears/consumer-client
RUN npm run build -w @gears/consumer-server

# Production stage
FROM node:18-slim

WORKDIR /app

# Install system dependencies required by TensorFlow.js Node
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./
COPY packages/consumer-server/package*.json ./packages/consumer-server/
COPY packages/core/package*.json ./packages/core/

# Install production dependencies only
RUN npm ci --production

# Copy built files from builder
COPY --from=builder /app/packages/consumer-server/dist ./packages/consumer-server/dist
COPY --from=builder /app/packages/core/dist ./packages/core/dist
COPY --from=builder /app/packages/consumer-client/dist ./packages/consumer-client/dist

# Copy model files from repository
COPY models ./models

# Create directories
RUN mkdir -p /app/secrets

# Expose port
EXPOSE 3002

# Set working directory to consumer-server
WORKDIR /app/packages/consumer-server

# Start the server
CMD ["node", "dist/index.js"]
