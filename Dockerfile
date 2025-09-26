# Development Dockerfile for FreshTrak Client
# This Dockerfile is optimized for local development with hot-reloading

FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install git (needed for some npm packages)
RUN apk add --no-cache git

# Copy package files
COPY package*.json ./

# Install dependencies using npm
# Note: We install all dependencies including devDependencies for development
RUN npm ci

# Copy the rest of the application
COPY . .

# Expose the development server port
EXPOSE 3000

# Set environment to development by default
ENV NODE_ENV=development

# Start the development server with hot-reloading
# Using npm run start which uses env-cmd -f .env.development
CMD ["npm", "start"]