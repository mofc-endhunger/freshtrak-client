import React from "react";

export interface HeaderContextType {
	isSignedIn: boolean;
	shortHeader: string;
}

export const themes: HeaderContextType = {
	isSignedIn: false,
	shortHeader: "navbar-green",
};

export const HeaderContext = React.createContext<HeaderContextType>(themes);

export const HeaderProvider = HeaderContext.Provider;
export const HeaderConsumer = HeaderContext.Consumer;

export default HeaderContext;
