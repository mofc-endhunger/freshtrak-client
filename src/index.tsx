import React from "react";
import { createRoot } from "react-dom/client";
import ReactGA from "react-ga";
import TagManager from "react-gtm-module";
import "bootstrap/dist/css/bootstrap.min.css";
import App from "./App";
import store from "./Store/store";
import { Provider } from "react-redux";

const GA_ID = process.env.REACT_APP_GA_ID;
if (GA_ID) {
	ReactGA.initialize(GA_ID);
	ReactGA.pageview(window.location.pathname + window.location.search);
}

const GTM_ID = process.env.REACT_APP_GTM_ID;
if (GTM_ID) {
	const tagManagerArgs = {
		gtmId: GTM_ID,
	};
	TagManager.initialize(tagManagerArgs);
}

const container = document.getElementById("root");
if (!container) {
	throw new Error("Root element not found");
}

const root = createRoot(container);

root.render(
	<Provider store={store}>
		<App />
	</Provider>
);
