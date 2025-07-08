# TypeScript Migration - Detailed Task List

## Phase 1: Setup and Infrastructure

### Task 1.1: Install TypeScript Dependencies

```bash
# Core TypeScript packages
npm install --save-dev typescript @types/react @types/react-dom @types/node

# Testing types
npm install --save-dev @types/jest @types/testing-library__react @types/testing-library__jest-dom

# React ecosystem types
npm install --save-dev @types/react-router-dom @types/react-redux

# Third-party library types
npm install --save-dev @types/react-facebook-login @types/qrcode.react
npm install --save-dev @types/react-places-autocomplete @types/react-rangeslider
npm install --save-dev @types/react-toastify @types/sweetalert2
npm install --save-dev @types/moment @types/axios
npm install --save-dev @types/react-bootstrap @types/react-bootstrap-time-picker
npm install --save-dev @types/react-ga @types/react-gtm-module
npm install --save-dev @types/react-hook-form @types/react-localization
npm install --save-dev @types/react-rangeslider @types/semantic-ui-react
```

### Task 1.2: Create TypeScript Configuration

Create `tsconfig.json` in root directory:

```json
{
	"compilerOptions": {
		"target": "es5",
		"lib": ["dom", "dom.iterable", "es6"],
		"allowJs": true,
		"skipLibCheck": true,
		"esModuleInterop": true,
		"allowSyntheticDefaultImports": true,
		"strict": true,
		"forceConsistentCasingInFileNames": true,
		"noFallthroughCasesInSwitch": true,
		"module": "esnext",
		"moduleResolution": "node",
		"resolveJsonModule": true,
		"isolatedModules": true,
		"noEmit": true,
		"jsx": "react-jsx",
		"baseUrl": "src",
		"paths": {
			"@/*": ["*"],
			"@components/*": ["Modules/*"],
			"@utils/*": ["Utils/*"],
			"@services/*": ["Services/*"],
			"@store/*": ["Store/*"],
			"@types/*": ["types/*"]
		}
	},
	"include": ["src/**/*"],
	"exclude": ["node_modules", "build", "dist"]
}
```

### Task 1.3: Create Type Definitions Directory

```bash
mkdir src/types
```

Create `src/types/index.ts`:

```typescript
// Global type definitions
export interface AppState {
	event: EventState;
	addressSearch: SearchState;
	user: UserState;
	language: LanguageState;
}

export interface EventState {
	events: Event[];
	loading: boolean;
	error: string | null;
}

export interface SearchState {
	searchResults: any[];
	loading: boolean;
	error: string | null;
}

export interface UserState {
	user: User | null;
	isAuthenticated: boolean;
	loading: boolean;
}

export interface LanguageState {
	language: string;
}

export interface User {
	id: string;
	name: string;
	email: string;
	// Add other user properties
}

export interface Event {
	id: string;
	title: string;
	description: string;
	date: string;
	location: string;
	// Add other event properties
}

// Component prop interfaces
export interface BaseComponentProps {
	className?: string;
	children?: React.ReactNode;
}

export interface ButtonProps extends BaseComponentProps {
	onClick?: () => void;
	disabled?: boolean;
	type?: "button" | "submit" | "reset";
	variant?:
		| "primary"
		| "secondary"
		| "success"
		| "danger"
		| "warning"
		| "info"
		| "light"
		| "dark";
}

export interface FormProps extends BaseComponentProps {
	onSubmit?: (data: any) => void;
	initialValues?: any;
}

// API response types
export interface ApiResponse<T> {
	data: T;
	status: number;
	message?: string;
}

export interface PaginatedResponse<T> {
	data: T[];
	total: number;
	page: number;
	limit: number;
}
```

## Phase 2: Core Infrastructure Migration

### Task 2.1: Migrate Store Files

#### Convert `src/Store/store.js` → `src/Store/store.ts`

```typescript
import { configureStore } from "@reduxjs/toolkit";
import eventReducer from "./Events/eventSlice";
import searchAddressReducer from "./Search/searchSlice";
import userReducer from "./userSlice";
import languageReducer from "./languageSlice";
import { AppState } from "../types";

export default configureStore({
	reducer: {
		event: eventReducer,
		addressSearch: searchAddressReducer,
		user: userReducer,
		language: languageReducer,
	},
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

#### Convert Redux Slices

For each slice file, add proper TypeScript types:

`src/Store/Events/eventSlice.ts`:

```typescript
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { EventState, Event } from "../../types";

const initialState: EventState = {
	events: [],
	loading: false,
	error: null,
};

const eventSlice = createSlice({
	name: "event",
	initialState,
	reducers: {
		setEvents: (state, action: PayloadAction<Event[]>) => {
			state.events = action.payload;
		},
		setLoading: (state, action: PayloadAction<boolean>) => {
			state.loading = action.payload;
		},
		setError: (state, action: PayloadAction<string | null>) => {
			state.error = action.payload;
		},
	},
});

export const { setEvents, setLoading, setError } = eventSlice.actions;
export default eventSlice.reducer;
```

### Task 2.2: Migrate Core Files

#### Convert `src/index.js` → `src/index.tsx`

```typescript
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import store from "./Store/store";
import App from "./App";
import ReactGA from "react-ga";

// Initialize Google Analytics
ReactGA.initialize("GA_TRACKING_ID");

const root = ReactDOM.createRoot(
	document.getElementById("root") as HTMLElement
);

root.render(
	<React.StrictMode>
		<Provider store={store}>
			<App />
		</Provider>
	</React.StrictMode>
);
```

#### Convert `src/App.js` → `src/App.tsx`

```typescript
import React from "react";
import AppRoutes from "./Core/Routes";
import { useSelector } from "react-redux";
import { RootState } from "./Store/store";

const App: React.FC = () => {
	React.useEffect(() => {}, []);
	const language = useSelector((state: RootState) => state.language.language);

	console.log("inside app routes app.js lan", language);

	return (
		<div className="App">
			<div className="main-wrapper">
				<AppRoutes language={language} />
			</div>
		</div>
	);
};

export default App;
```

### Task 2.3: Migrate Services and Utils

#### Convert `src/Services/ApiService.js` → `src/Services/ApiService.ts`

```typescript
import axios, { AxiosInstance, AxiosResponse } from "axios";
import { ApiResponse } from "../types";

class ApiService {
	private api: AxiosInstance;

	constructor() {
		this.api = axios.create({
			baseURL: process.env.REACT_APP_API_URL,
			headers: {
				"Content-Type": "application/json",
			},
		});
	}

	async get<T>(url: string): Promise<ApiResponse<T>> {
		const response: AxiosResponse<ApiResponse<T>> = await this.api.get(url);
		return response.data;
	}

	async post<T>(url: string, data: any): Promise<ApiResponse<T>> {
		const response: AxiosResponse<ApiResponse<T>> = await this.api.post(
			url,
			data
		);
		return response.data;
	}

	async put<T>(url: string, data: any): Promise<ApiResponse<T>> {
		const response: AxiosResponse<ApiResponse<T>> = await this.api.put(
			url,
			data
		);
		return response.data;
	}

	async delete<T>(url: string): Promise<ApiResponse<T>> {
		const response: AxiosResponse<ApiResponse<T>> = await this.api.delete(
			url
		);
		return response.data;
	}
}

export default new ApiService();
```

## Phase 3: Component Migration Examples

### Task 3.1: Convert Simple Components

#### Convert `src/Modules/General/ButtonComponent.js` → `ButtonComponent.tsx`

```typescript
import React from "react";
import { ButtonProps } from "../../types";

const ButtonComponent: React.FC<ButtonProps> = ({
	children,
	onClick,
	disabled = false,
	type = "button",
	variant = "primary",
	className = "",
	...props
}) => {
	return (
		<button
			type={type}
			onClick={onClick}
			disabled={disabled}
			className={`btn btn-${variant} ${className}`}
			{...props}
		>
			{children}
		</button>
	);
};

export default ButtonComponent;
```

#### Convert `src/Modules/General/LogoComponent.js` → `LogoComponent.tsx`

```typescript
import React from "react";
import { BaseComponentProps } from "../../types";

interface LogoComponentProps extends BaseComponentProps {
	src?: string;
	alt?: string;
	width?: number;
	height?: number;
}

const LogoComponent: React.FC<LogoComponentProps> = ({
	src = "/logo.png",
	alt = "Logo",
	width = 150,
	height = 50,
	className = "",
	...props
}) => {
	return (
		<img
			src={src}
			alt={alt}
			width={width}
			height={height}
			className={`logo ${className}`}
			{...props}
		/>
	);
};

export default LogoComponent;
```

### Task 3.2: Convert Complex Components

#### Convert `src/Modules/Events/EventCardComponent.js` → `EventCardComponent.tsx`

```typescript
import React, { useState } from "react";
import { Event } from "../../types";

interface EventCardProps {
	event: Event;
	onCardClick?: (event: Event) => void;
	className?: string;
}

const EventCardComponent: React.FC<EventCardProps> = ({
	event,
	onCardClick,
	className = "",
}) => {
	const [isHovered, setIsHovered] = useState(false);

	const handleClick = () => {
		if (onCardClick) {
			onCardClick(event);
		}
	};

	return (
		<div
			className={`event-card ${className}`}
			onClick={handleClick}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			<h3>{event.title}</h3>
			<p>{event.description}</p>
			<div className="event-meta">
				<span>{event.date}</span>
				<span>{event.location}</span>
			</div>
		</div>
	);
};

export default EventCardComponent;
```

## Phase 4: Testing Migration

### Task 4.1: Convert Test Files

#### Convert `src/Modules/Events/__test__/eventCardComponent.test.js` → `eventCardComponent.test.tsx`

```typescript
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import EventCardComponent from "../EventCardComponent";
import { Event } from "../../../types";

const mockEvent: Event = {
	id: "1",
	title: "Test Event",
	description: "Test Description",
	date: "2024-01-01",
	location: "Test Location",
};

describe("EventCardComponent", () => {
	it("renders event information correctly", () => {
		render(<EventCardComponent event={mockEvent} />);

		expect(screen.getByText("Test Event")).toBeInTheDocument();
		expect(screen.getByText("Test Description")).toBeInTheDocument();
		expect(screen.getByText("2024-01-01")).toBeInTheDocument();
		expect(screen.getByText("Test Location")).toBeInTheDocument();
	});

	it("calls onCardClick when clicked", () => {
		const mockOnClick = jest.fn();
		render(
			<EventCardComponent event={mockEvent} onCardClick={mockOnClick} />
		);

		fireEvent.click(screen.getByText("Test Event"));
		expect(mockOnClick).toHaveBeenCalledWith(mockEvent);
	});
});
```

## Phase 5: Configuration Updates

### Task 5.1: Update package.json Scripts

```json
{
	"scripts": {
		"start": "env-cmd -f .env.development react-scripts start",
		"build": "env-cmd -f .env.${REACT_APP_ENV} react-scripts build",
		"build:development": "REACT_APP_ENV=development yarn build",
		"build:beta": "REACT_APP_ENV=beta yarn build",
		"build:production": "REACT_APP_ENV=production yarn build",
		"test": "react-scripts test",
		"eject": "react-scripts eject",
		"type-check": "tsc --noEmit",
		"lint": "eslint src --ext .ts,.tsx,.js,.jsx",
		"lint:fix": "eslint src --ext .ts,.tsx,.js,.jsx --fix"
	}
}
```

### Task 5.2: Update ESLint Configuration

Create `.eslintrc.js`:

```javascript
module.exports = {
	extends: ["react-app", "react-app/jest", "@typescript-eslint/recommended"],
	parser: "@typescript-eslint/parser",
	plugins: ["@typescript-eslint"],
	rules: {
		"@typescript-eslint/no-unused-vars": "error",
		"@typescript-eslint/no-explicit-any": "warn",
		"react-hooks/exhaustive-deps": "warn",
	},
};
```

## Migration Checklist for Each File

For each file being converted, follow this checklist:

### Pre-Conversion Checklist

-   [ ] Backup original file
-   [ ] Analyze component dependencies
-   [ ] Identify prop types and interfaces needed
-   [ ] Check for any external library usage

### Conversion Steps

1. [ ] Rename file from `.js` to `.tsx`
2. [ ] Add React import if not present
3. [ ] Define prop interfaces
4. [ ] Add type annotations to function parameters
5. [ ] Add return type annotations
6. [ ] Convert class components to functional components if applicable
7. [ ] Add proper event handler types
8. [ ] Update import statements to use TypeScript syntax
9. [ ] Add proper state types for useState hooks
10. [ ] Add proper effect types for useEffect hooks

### Post-Conversion Checklist

-   [ ] Run TypeScript compiler to check for errors
-   [ ] Run tests to ensure functionality is preserved
-   [ ] Update any import statements in other files
-   [ ] Verify component renders correctly
-   [ ] Check for any console errors

## Common TypeScript Patterns

### Functional Component with Props

```typescript
interface ComponentProps {
	title: string;
	description?: string;
	onClick?: () => void;
}

const Component: React.FC<ComponentProps> = ({
	title,
	description,
	onClick,
}) => {
	return (
		<div onClick={onClick}>
			<h1>{title}</h1>
			{description && <p>{description}</p>}
		</div>
	);
};
```

### useState with TypeScript

```typescript
const [count, setCount] = useState<number>(0);
const [user, setUser] = useState<User | null>(null);
const [items, setItems] = useState<string[]>([]);
```

### useEffect with TypeScript

```typescript
useEffect(() => {
	// Effect logic
}, [dependencies]);

useEffect(() => {
	const fetchData = async () => {
		// Async logic
	};
	fetchData();
}, []);
```

### Event Handlers

```typescript
const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
	// Handler logic
};

const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
	// Handler logic
};

const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
	// Handler logic
};
```

This detailed task list provides a comprehensive roadmap for migrating the FreshTrak client from JavaScript to TypeScript while maintaining all existing functionality and following React/TypeScript best practices.
