# Frontend Development Setup

This guide covers setting up the FreshTrak Client frontend development environment.

## Prerequisites

-   **Node.js**: Version 16 or higher
-   **Package Manager**: Yarn (recommended) or npm
-   **Git**: For version control
-   **Code Editor**: VS Code (recommended) with React extensions

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/mofc-endhunger/freshtrak-client.git
cd freshtrak-client
```

### 2. Install Dependencies

```bash
# Using Yarn (recommended)
yarn install

# Or using npm
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```bash
# Copy the example environment file
cp .env.example .env
```

Configure the following environment variables:

```env
# Google Maps API (for address autocomplete and maps)
REACT_APP_GOOGLE_API_KEY=your_google_maps_api_key

# API Configuration
REACT_APP_API_BASE_URL=https://api.freshtrak.com

# Environment
NODE_ENV=development
```

### 4. Start Development Server

```bash
# Start the development server
yarn start
# or
npm start
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Development Tools

### Recommended VS Code Extensions

-   **ES7+ React/Redux/React-Native snippets**
-   **Prettier - Code formatter**
-   **ESLint**
-   **Auto Rename Tag**
-   **Bracket Pair Colorizer**

### Code Quality Tools

```bash
# Run linting
yarn lint
# or
npm run lint

# Fix linting issues automatically
yarn lint:fix
# or
npm run lint:fix
```

## Testing

### Running Tests

```bash
# Run all tests
yarn test
# or
npm test

# Run tests in watch mode
yarn test:watch
# or
npm run test:watch

# Generate test coverage report
yarn test:coverage
# or
npm run test:coverage
```

### Test Structure

-   Unit tests: `src/**/__test__/*.test.js`
-   Component tests: `src/Modules/**/__test__/*.test.js`
-   Utility tests: `src/Utils/__test__/*.test.js`

## Build and Deployment

### Development Build

```bash
yarn build:dev
# or
npm run build:dev
```

### Production Build

```bash
yarn build
# or
npm run build
```

### Analyze Bundle

```bash
yarn build:analyze
# or
npm run build:analyze
```

## Project Structure

```
src/
├── Assets/          # Static assets (images, styles)
├── Core/            # Core application files
├── Modules/         # Feature modules
│   ├── Events/      # Event management
│   ├── Family/      # Family registration
│   ├── General/     # Shared components
│   └── ...
├── Services/        # API services
├── Store/           # Redux store and slices
├── Utils/           # Utility functions
└── Testing/         # Test utilities and mocks
```

## Common Issues and Solutions

### Port Already in Use

If port 3000 is already in use:

```bash
# Use a different port
PORT=3001 yarn start
```

### Google Maps API Issues

If you see Google Maps API errors:

1. Ensure `REACT_APP_GOOGLE_API_KEY` is set in `.env`
2. Verify the API key has the necessary permissions
3. Check the Google Cloud Console for API quotas

### Build Errors

If you encounter build errors:

```bash
# Clear cache and reinstall dependencies
rm -rf node_modules package-lock.json
yarn install
# or
npm install
```

## Additional Resources

-   [React Documentation](https://reactjs.org/docs/)
-   [Redux Toolkit](https://redux-toolkit.js.org/)
-   [React Router](https://reactrouter.com/)
-   [Jest Testing](https://jestjs.io/docs/getting-started)
-   [Create React App](https://create-react-app.dev/docs/getting-started/)
