# FreshTrak Docker Setup Guide

This guide explains how to use Docker with the FreshTrak React application for both development and production environments.

## 🚀 Quick Start

### Prerequisites

-   Docker Desktop installed and running
-   Docker Compose available
-   Node.js 18+ (for local development without Docker)

### Quick Commands

```bash
# Build and start development environment
docker-compose up freshtrak-dev

# Build production image
docker build -t freshtrak:prod .

# Run production container
docker run -p 8080:80 freshtrak:prod
```

## 📁 Docker Files Overview

### Core Files

-   **`Dockerfile`** - Multi-stage production build with nginx
-   **`Dockerfile.dev`** - Development environment with hot reload
-   **`docker-compose.yml`** - Local development orchestration
-   **`nginx.conf`** - Custom nginx configuration for production
-   **`.dockerignore`** - Optimized build context

### Build Scripts

-   **`docker-build.sh`** - Unix/Linux build script
-   **`docker-build.bat`** - Windows build script

## 🏗️ Architecture

### Multi-Stage Production Build

```
Builder Stage (node:18-alpine)
├── Install dependencies
├── Copy source code
└── Build React application

Production Stage (nginx:alpine)
├── Copy built assets
├── Configure nginx
├── Security hardening
└── Health checks
```

### Development Environment

```
Single Stage (node:18-alpine)
├── Install all dependencies
├── Volume mounts for hot reload
├── Development server on port 3000
└── Health checks
```

## 🔧 Usage

### Development Environment

#### Start Development Server

```bash
# Start development environment
docker-compose up freshtrak-dev

# Or run in background
docker-compose up -d freshtrak-dev
```

#### Access Development Server

-   **URL**: http://localhost:3000
-   **Hot Reload**: Enabled with volume mounts
-   **Environment**: Uses `.env.development` file

#### Stop Development Environment

```bash
docker-compose down
```

### Production Build

#### Build Production Image

```bash
# Using build script (Windows)
docker-build.bat prod

# Using build script (Unix/Linux)
./docker-build.sh prod

# Manual build
docker build -t freshtrak:prod .
```

#### Run Production Container

```bash
# Run on port 8080
docker run -p 8080:80 freshtrak:prod

# Run in background
docker run -d -p 8080:80 --name freshtrak-prod freshtrak:prod

# Run with custom environment variables
docker run -p 8080:80 -e NODE_ENV=production freshtrak:prod
```

#### Access Production Server

-   **URL**: http://localhost:8080
-   **Health Check**: http://localhost:8080/health

### Testing

#### Run Tests in Container

```bash
# Using build script
docker-build.bat test

# Manual test execution
docker build -f Dockerfile.dev -t freshtrak:test .
docker run --rm freshtrak:test npm test -- --watchAll=false --passWithNoTests
```

## 🐳 Docker Compose Services

### Development Service (`freshtrak-dev`)

-   **Port**: 3000
-   **Features**: Hot reload, source mounting, development dependencies
-   **Volumes**: Source code mounted, node_modules excluded
-   **Environment**: Development configuration

### Production Test Service (`freshtrak-prod-test`)

-   **Port**: 8080
-   **Features**: Production build testing, nginx serving
-   **Purpose**: Validate production build locally

## 🔒 Security Features

### Container Security

-   **Non-root user**: Runs as `nginx` user (UID 1001)
-   **Read-only filesystem**: Production container has minimal write access
-   **Resource limits**: Configured in nginx and Docker
-   **Network security**: Restricted port access

### Application Security

-   **Security headers**: XSS protection, content type options, frame options
-   **Content Security Policy**: Restricts resource loading
-   **Rate limiting**: API and login endpoint protection
-   **HTTPS ready**: Configured for SSL/TLS termination

## 📊 Performance Optimizations

### Nginx Configuration

-   **Gzip compression**: Enabled for text-based assets
-   **Static asset caching**: Long-term caching for static files
-   **SPA routing**: Fallback to index.html for client-side routing
-   **Connection optimization**: Keep-alive and TCP optimizations

### Docker Optimizations

-   **Multi-stage build**: Reduces final image size
-   **Layer caching**: Optimized dependency installation
-   **Alpine base**: Minimal base images for security and size
-   **Health checks**: Built-in container health monitoring

## 🧪 Testing and Validation

### Health Checks

-   **Development**: HTTP endpoint check on port 3000
-   **Production**: `/health` endpoint with JSON response
-   **Interval**: 30 seconds with 3 retry attempts

### Build Validation

```bash
# Validate production build
docker build -t freshtrak:test .
docker run --rm -p 8080:80 freshtrak:test

# Check health endpoint
curl http://localhost:8080/health

# Validate static assets
curl http://localhost:8080/static/js/main.js
```

## 🔧 Customization

### Environment Variables

The application supports environment variable injection through:

-   **Development**: `.env.development` file
-   **Production**: Runtime environment variables
-   **Container**: Docker environment variables

### Nginx Configuration

Customize `nginx.conf` for:

-   **SSL/TLS**: Add certificate configuration
-   **Caching**: Modify cache policies
-   **Security**: Adjust security headers
-   **Routing**: Custom location rules

### Dockerfile Modifications

-   **Base images**: Change Node.js or nginx versions
-   **Dependencies**: Add system packages
-   **Build process**: Customize build steps
-   **Security**: Additional hardening measures

## 🚨 Troubleshooting

### Common Issues

#### Build Failures

```bash
# Check Docker daemon
docker info

# Clean build context
docker system prune -a

# Verify Dockerfile syntax
docker build --no-cache -t test .
```

#### Container Won't Start

```bash
# Check container logs
docker logs <container_name>

# Verify port availability
netstat -an | grep :3000

# Check resource usage
docker stats
```

#### Hot Reload Not Working

```bash
# Verify volume mounts
docker inspect <container_name>

# Check file permissions
docker exec -it <container_name> ls -la /app

# Restart development service
docker-compose restart freshtrak-dev
```

### Debug Commands

```bash
# Enter running container
docker exec -it <container_name> /bin/sh

# Check nginx configuration
docker exec -it <container_name> nginx -t

# View nginx logs
docker exec -it <container_name> tail -f /var/log/nginx/error.log
```

## 📈 Monitoring

### Health Check Endpoints

-   **Development**: Built-in React dev server health check
-   **Production**: `/health` and `/health.json` endpoints
-   **Docker**: Container health check integration

### Logging

-   **Application**: React application logs
-   **Nginx**: Access and error logs
-   **Container**: Docker container logs

### Metrics

-   **Performance**: Response times and throughput
-   **Resources**: CPU, memory, and disk usage
-   **Security**: Failed requests and rate limiting

## 🔄 CI/CD Integration

### Build Commands for CI/CD

```bash
# Build production image
docker build -t freshtrak:${BUILD_NUMBER} .

# Tag for registry
docker tag freshtrak:${BUILD_NUMBER} registry/freshtrak:latest

# Push to registry
docker push registry/freshtrak:latest
```

### Testing in CI/CD

```bash
# Build and test
docker build -f Dockerfile.dev -t test .
docker run --rm test npm test -- --watchAll=false --passWithNoTests

# Security scan
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image freshtrak:latest
```

## 📚 Additional Resources

### Documentation

-   [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
-   [Nginx Configuration](https://nginx.org/en/docs/)
-   [React Production Build](https://create-react-app.dev/docs/production-build/)

### Security

-   [Container Security Best Practices](https://docs.docker.com/engine/security/)
-   [OWASP Security Headers](https://owasp.org/www-project-secure-headers/)

### Performance

-   [Nginx Performance Tuning](https://nginx.org/en/docs/http/ngx_http_core_module.html)
-   [Docker Performance Best Practices](https://docs.docker.com/config/containers/resource_constraints/)

---

## 📞 Support

For issues or questions:

1. Check the troubleshooting section above
2. Review Docker and nginx logs
3. Verify configuration files
4. Test with minimal configuration

**Last Updated**: December 2024  
**Version**: 1.0
