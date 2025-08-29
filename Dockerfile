# FreshTrak React Application - Multi-stage Dockerfile
# Build Stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies for native modules (if needed)
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN REACT_APP_ENV=production npm run build

# Production Stage
FROM nginx:alpine AS production

# Install necessary packages and remove default nginx config
RUN apk add --no-cache curl && \
    rm -rf /etc/nginx/conf.d/default.conf

# Create non-root user for security
RUN adduser -S -D -H -u 1001 -h /var/cache/nginx -s /sbin/nologin -G nginx freshtrak

# Copy built application from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create health check endpoint
RUN echo '{"status":"healthy","timestamp":"$(date)"}' > /usr/share/nginx/html/health && \
    echo '{"status":"healthy","timestamp":"$(date)"}' > /usr/share/nginx/html/health.json

# Set proper permissions
RUN chown -R freshtrak:nginx /usr/share/nginx/html && \
    chown -R freshtrak:nginx /var/cache/nginx && \
    chown -R freshtrak:nginx /var/log/nginx && \
    chown -R freshtrak:nginx /etc/nginx/conf.d && \
    chmod -R 755 /usr/share/nginx/html

# Switch to non-root user
USER freshtrak

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
