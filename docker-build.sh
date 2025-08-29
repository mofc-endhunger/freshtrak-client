#!/bin/bash

# FreshTrak Docker Build Script
# Usage: ./docker-build.sh [dev|prod|test|clean]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to build development image
build_dev() {
    print_status "Building development Docker image..."
    docker build -f Dockerfile.dev -t freshtrak:dev .
    print_success "Development image built successfully!"
}

# Function to build production image
build_prod() {
    print_status "Building production Docker image..."
    docker build -f Dockerfile -t freshtrak:prod .
    print_success "Production image built successfully!"
}

# Function to run tests
run_tests() {
    print_status "Running tests in container..."
    
    # Build test image
    docker build -f Dockerfile.dev -t freshtrak:test .
    
    # Run tests
    docker run --rm freshtrak:test npm test -- --watchAll=false --passWithNoTests
    
    print_success "Tests completed successfully!"
}

# Function to clean up
cleanup() {
    print_status "Cleaning up Docker resources..."
    
    # Stop and remove containers
    docker-compose down --remove-orphans
    
    # Remove images
    docker rmi freshtrak:dev freshtrak:prod freshtrak:test 2>/dev/null || true
    
    # Remove dangling images
    docker image prune -f
    
    print_success "Cleanup completed!"
}

# Function to show usage
show_usage() {
    echo "FreshTrak Docker Build Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  dev     Build development image"
    echo "  prod    Build production image"
    echo "  test    Run tests in container"
    echo "  clean   Clean up Docker resources"
    echo "  all     Build both dev and prod images"
    echo "  help    Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 dev      # Build development image"
    echo "  $0 prod     # Build production image"
    echo "  $0 test     # Run tests"
    echo "  $0 clean    # Clean up resources"
}

# Function to build all images
build_all() {
    build_dev
    build_prod
    print_success "All images built successfully!"
}

# Main script logic
case "${1:-help}" in
    dev)
        build_dev
        ;;
    prod)
        build_prod
        ;;
    test)
        run_tests
        ;;
    clean)
        cleanup
        ;;
    all)
        build_all
        ;;
    help|--help|-h)
        show_usage
        ;;
    *)
        print_error "Unknown command: $1"
        show_usage
        exit 1
        ;;
esac
