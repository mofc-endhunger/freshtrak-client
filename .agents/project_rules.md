# FreshTrak Client - AI and Developer Rules

## Project Overview
This is a React-based foor pantry locator and registration application with Redux state management, React Router navigation, and Leaflet maps integration.

## Code Style & Architecture

### React Components
- Use functional components with hooks instead of class components
- Follow the existing component structure: Container components for logic, Component files for UI
- Use React Hook Form for form handling (already implemented)
- Implement proper prop validation and TypeScript-like prop documentation
- Keep components focused and single-responsibility

### File Organization
- Follow the existing module structure in `src/Modules/`
- Container components handle business logic and API calls
- Component files focus on UI rendering
- Keep related components in the same module directory
- Use the existing naming convention: `ComponentName.js` and `ComponentNameContainer.js`

### State Management
- Use Redux Toolkit for global state (already configured)
- Follow the existing slice pattern in `src/Store/`
- Use local state for component-specific data
- Implement proper loading states and error handling

### Styling
- Use SCSS for styling (already configured)
- Follow the existing SCSS structure in `src/Assets/scss/`
- Use Bootstrap classes when appropriate (already included)
- Maintain responsive design principles

### Testing
- Write tests for all new components and containers
- Follow the existing test structure in `__test__/` directories
- Use React Testing Library for component testing
- Mock external dependencies and API calls

### API Integration
- Use the existing `ApiService.js` for API calls
- Implement proper error handling and loading states
- Use axios interceptors for common request/response handling
- Follow RESTful conventions

### Maps Integration
- Use React Leaflet for map components
- Follow the existing map utility patterns in `src/Utils/MapUtils.js`
- Implement proper map event handling and state management

### Internationalization
- Use react-localization for text localization
- Follow the existing localization patterns
- Keep text content separate from component logic

### Performance
- Implement React.memo for expensive components
- Use useCallback and useMemo appropriately
- Lazy load components when beneficial
- Optimize bundle size by analyzing imports

### Accessibility
- Include proper ARIA labels and roles
- Ensure keyboard navigation works
- Maintain proper color contrast
- Test with screen readers

### Security
- Sanitize user inputs
- Implement proper authentication flows
- Use environment variables for sensitive data
- Follow OWASP guidelines

## Common Patterns to Follow

### Component Structure
```javascript
// Container component pattern
const ComponentContainer = () => {
  // State and logic
  return <Component data={data} />
}

// Component pattern
const Component = ({ data }) => {
  // UI rendering
  return <div>...</div>
}
```

### Error Handling
```javascript
// Always implement error boundaries and try-catch blocks
// Use the existing ErrorComponent for consistent error display
```

### Loading States
```javascript
// Use the existing LoadingSpinner component
// Implement skeleton loading for better UX
```

## Avoid
- Class components (use functional components with hooks)
- Direct DOM manipulation
- Inline styles (use SCSS classes)
- Hardcoded strings (use localization)
- Complex nested ternary operators
- Large monolithic components

## Focus Areas
- Maintain the existing module-based architecture
- Follow the established testing patterns
- Use the existing utility functions and constants
- Keep the codebase consistent with current patterns
- Prioritize accessibility and user experience 