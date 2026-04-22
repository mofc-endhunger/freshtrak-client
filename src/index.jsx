import React from "react";
import { createRoot } from "react-dom/client";
import ReactGA from "react-ga";
import TagManager from "react-gtm-module";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import App from "./App";
import config from "./config";
import store, { persistor } from "./Store/store";

import "leaflet/dist/leaflet.css";
import "./index.css";

const nodeEnv = typeof process !== "undefined" ? process.env.NODE_ENV : undefined;
const shouldLogRuntimeConfigDiagnostics =
	nodeEnv !== "production" && nodeEnv !== "test";

if (shouldLogRuntimeConfigDiagnostics) {
	const requiredConfigKeys = [
		"PANTRY_FINDER_API",
		"REGISTRATION_API",
		"USER_POOL_ID",
		"USER_POOL_CLIENT_ID",
		"AWS_REGION",
	];

	const missingKeys = requiredConfigKeys.filter((key) => !config[key]);
	if (missingKeys.length > 0) {
		console.warn(
			`[config] Missing runtime config keys: ${missingKeys.join(", ")}`
		);
	} else {
		console.info("[config] Runtime configuration loaded successfully.");
	}
}

const GOOGLE_GEOLOCATION_KEY = config.GOOGLE_GEOLOCATION_KEY;
if (GOOGLE_GEOLOCATION_KEY && typeof document !== "undefined") {
	const existingScript = document.getElementById("google-maps-script");
	if (!existingScript) {
		const googleMapsScript = document.createElement("script");
		googleMapsScript.id = "google-maps-script";
		googleMapsScript.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
			GOOGLE_GEOLOCATION_KEY
		)}&libraries=places&loading=async`;
		googleMapsScript.async = true;
		googleMapsScript.defer = true;
		document.body.appendChild(googleMapsScript);
	}
}

const GA_ID = config.GA_ID;
if (GA_ID) {
	ReactGA.initialize(GA_ID);
	ReactGA.pageview(window.location.pathname + window.location.search);
}

const GTM_ID = config.GTM_ID;
if (GTM_ID) {
	TagManager.initialize({ gtmId: GTM_ID });
}

const container = document.getElementById("root");
if (container) {
	const root = createRoot(container);

	root.render(
		<Provider store={store}>
			<PersistGate loading={null} persistor={persistor}>
				<App />
			</PersistGate>
		</Provider>
	);
}
