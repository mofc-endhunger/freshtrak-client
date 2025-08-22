import React, { createContext, useContext } from "react";

// Header context themes interface
export interface HeaderThemes {
	/** Whether user is signed in */
	isSignedIn: boolean;
	/** Short header variant class */
	shortHeader: string;
}

// Header context interface
export interface HeaderContextType {
	/** Header themes configuration */
	themes: HeaderThemes;
}

// Default themes
export const themes: HeaderThemes = {
	isSignedIn: false,
	shortHeader: "navbar-green",
};

// Create the context with default values
export const HeaderContext = createContext<HeaderContextType>({
	themes,
});

// Provider component
export const HeaderProvider: React.FC<{
	children: React.ReactNode;
	value?: HeaderContextType;
}> = ({ children, value = { themes } }) => {
	return (
		<HeaderContext.Provider value={value}>
			{children}
		</HeaderContext.Provider>
	);
};

// Consumer component
export const HeaderConsumer = HeaderContext.Consumer;

// Custom hook for using header context
export const useHeaderContext = (): HeaderContextType => {
	const context = useContext(HeaderContext);
	if (!context) {
		throw new Error(
			"useHeaderContext must be used within a HeaderProvider"
		);
	}
	return context;
};

export default HeaderContext;
