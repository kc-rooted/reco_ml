# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files from monorepo root
COPY package*.json ./
COPY packages/consumer-server/package*.json ./packages/consumer-server/
COPY packages/core/package*.json ./packages/core/

# Install dependencies
RUN npm ci

# Copy source code and config files
COPY packages/consumer-server ./packages/consumer-server
COPY packages/core ./packages/core
COPY tsconfig.json ./
COPY tsconfig.base.json ./
COPY config ./config

# Build the packages
RUN npm run build -w @gears/core

# Verify core package is available
RUN ls -la /app/packages/core/dist/ && \
    ls -la /app/node_modules/@gears/ || true

RUN npm run build -w @gears/consumer-server

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/consumer-server/package*.json ./packages/consumer-server/
COPY packages/core/package*.json ./packages/core/

# Install production dependencies only
RUN npm ci --production

# Copy built files from builder
COPY --from=builder /app/packages/consumer-server/dist ./packages/consumer-server/dist
COPY --from=builder /app/packages/core/dist ./packages/core/dist

# Create directories
RUN mkdir -p /app/models /app/secrets

# Models will be mounted as a volume in production
# For local testing, you can mount: -v ./models:/app/models

# Expose port
EXPOSE 3002

# Set working directory to consumer-server
WORKDIR /app/packages/consumer-server

# Start the server
CMD ["node", "dist/index.js"]
