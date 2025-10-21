# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files from monorepo root
COPY package*.json ./
COPY packages/consumer-server/package*.json ./packages/consumer-server/
COPY packages/core/package*.json ./packages/core/

# Install dependencies
RUN npm ci

# Copy source code
COPY packages/consumer-server ./packages/consumer-server
COPY packages/core ./packages/core
COPY tsconfig.json ./

# Build the packages
RUN npm run build -w @gears/core
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

# Copy models directory
COPY models ./models

# Create directory for service account key (will be provided via env var)
RUN mkdir -p /app/secrets

# Expose port
EXPOSE 3002

# Set working directory to consumer-server
WORKDIR /app/packages/consumer-server

# Start the server
CMD ["node", "dist/index.js"]
