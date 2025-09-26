# FreshTrak Client

A modern React-based web application for food bank event management and family registrations. FreshTrak connects families in need with food distribution events, streamlining the reservation process and improving food security access.

## 🎯 Overview

FreshTrak Client is the frontend application for the FreshTrak platform, enabling:
- **Families** to find and register for food distribution events
- **Food banks** to manage event information and capacity
- **Communities** to improve food distribution efficiency

## 🚀 Quick Start

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (recommended for development)
- OR [Node.js v20](https://nodejs.org/) and npm (for non-Docker development)

### Development with Docker (Recommended)

Docker provides a consistent development environment across all team members:

```bash
# 1. Clone the repository
git clone <repository-url>
cd freshtrak-client

# 2. Copy environment variables
cp .env.development.example .env.development
# Edit .env.development with your configuration

# 3. Build and start the development container
npm run docker:up

# 4. Access the application
# Open http://localhost:3000 in your browser
```

#### Docker Commands

```bash
npm run docker:up      # Start development container
npm run docker:down    # Stop container
npm run docker:logs    # View container logs
npm run docker:shell   # Access container shell
npm run docker:rebuild # Rebuild after dependency changes
```

### Development without Docker

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.development.example .env.development
# Edit .env.development with your configuration

# 3. Start development server
npm start

# 4. Open http://localhost:3000
```

## 🏗️ Architecture

### Technology Stack

- **Frontend Framework**: React 18.2 with TypeScript
- **State Management**: Redux Toolkit with Redux Persist
- **Routing**: React Router v6
- **Authentication**: AWS Amplify/Cognito
- **Styling**:
  - Tailwind CSS (primary)
  - Bootstrap 4.6 (legacy, being phased out)
  - Radix UI primitives for accessible components
- **API Communication**: Axios
- **Forms**: React Hook Form with Zod validation
- **Maps**: Leaflet/React Leaflet
- **Testing**: Jest with React Testing Library

### Project Structure

```
src/
├── Modules/                 # Feature-based modules
│   ├── Authentication/      # AWS Cognito integration
│   ├── Dashboard/           # User dashboard
│   ├── Events/             # Event listing and details
│   ├── Family/             # Family/user management
│   ├── Registration/       # Event registration flow
│   └── Home/               # Landing page
├── Store/                  # Redux store configuration
│   ├── Events/            # Event state management
│   ├── Search/            # Search state
│   └── userSlice.js       # User state
├── components/            # Reusable UI components
│   └── ui/               # Base UI components (buttons, forms, etc.)
├── Utils/                # Utility functions and constants
└── Services/            # API service layer
```

## 🔧 Configuration

### Environment Variables

Environment files are used for different deployment stages:
- `.env.development` - Local development
- `.env.beta` - Beta/staging environment
- `.env.production` - Production environment

Key variables (see `.env.development.example`):
```bash
REACT_APP_ENV=development
REACT_APP_PANTRY_FINDER_API=<backend-api-url>
REACT_APP_REGISTRATION_API=<registration-api-url>
REACT_APP_AWS_REGION=us-east-1
REACT_APP_USER_POOL_ID=<cognito-pool-id>
REACT_APP_USER_POOL_CLIENT_ID=<cognito-client-id>
REACT_APP_GOOGLE_MAPS_API_KEY=<google-maps-key>
```

## 📦 Available Scripts

### Development
```bash
npm start              # Start development server
npm test              # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

### Building
```bash
npm run build:development  # Build for development
npm run build:beta        # Build for beta/staging
npm run build:production # Build for production
```

### Docker Development
```bash
npm run docker:build   # Build Docker image
npm run docker:up      # Start container
npm run docker:down    # Stop container
npm run docker:logs    # View logs
npm run docker:shell   # Container shell access
npm run docker:rebuild # Full rebuild
```

## 🚢 Deployment

The application uses AWS services for deployment:

### Current Architecture (Production)
- **Hosting**: AWS S3 static website hosting
- **CDN**: CloudFront for global distribution
- **CI/CD**: AWS CodeBuild with `buildspec.yml`
- **Deployment Script**: `deploy.sh` handles S3 upload and CloudFront invalidation

### Deployment Process
```bash
# Beta deployment
./deploy.sh beta

# Production deployment
./deploy.sh production
```

The build process:
1. CodeBuild triggers on git push
2. Builds the React application
3. Uploads to S3 bucket
4. Invalidates CloudFront cache

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- --testPathPattern=Family

# Update snapshots
npm test -- -u
```

## 📝 License

This project is part of the FreshTrak platform for food bank management and distribution.

## 🆘 Support

For questions or issues:
- Check existing [GitHub Issues](https://github.com/[org]/freshtrak-client/issues)
- Review documentation in `/docs`
- Contact the development team

---

Built with ❤️ to fight food insecurity and strengthen communities.