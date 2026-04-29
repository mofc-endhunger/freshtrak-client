# Use patched, pinned image variants to reduce CVE drift from floating tags.
ARG NODE_VERSION=20.19.5
ARG NGINX_VERSION=1.27.5
ARG ALPINE_VERSION=3.21

# Base stage for all environments
FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS base

WORKDIR /app

# Copy package files
COPY package*.json ./

# Development stage
FROM base AS development

# Install git (needed for some npm packages)
RUN apk add --no-cache git

# Install all dependencies (including devDependencies)
RUN npm ci

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Start in development mode with hot reload
CMD ["npm", "start"]

# Builder stage for production
FROM base AS builder

# Install git (needed for some npm packages)
RUN apk add --no-cache git

# Install all dependencies (needed for build)
RUN npm ci

# Copy application code
COPY . .

# Build the application
RUN npm run build:production

# Production stage
FROM nginx:${NGINX_VERSION}-alpine${ALPINE_VERSION} AS production

WORKDIR /usr/share/nginx/html

# Upgrade base OS packages, then remove default nginx static assets
RUN apk upgrade --no-cache && rm -rf ./*

# Copy built application from builder stage
COPY --from=builder /app/dist .

# Copy entrypoint script for runtime configuration
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Copy nginx configuration for SPA routing
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Use entrypoint script to inject runtime config and start nginx
CMD ["/entrypoint.sh"]