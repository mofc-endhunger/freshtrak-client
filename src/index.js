import React from 'react';
import { createRoot } from 'react-dom/client';
import ReactGA from 'react-ga';
import TagManager from 'react-gtm-module';
import App from './App';
import store, { persistor } from './Store/store';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import 'leaflet/dist/leaflet.css';
import './index.css';
import config from './config';

const GA_ID = config.GA_ID;
if (GA_ID) {
  ReactGA.initialize(GA_ID);
  ReactGA.pageview(window.location.pathname + window.location.search);
}

const GTM_ID = config.GTM_ID;
const tagManagerArgs = {
  gtmId: GTM_ID,
};
TagManager.initialize(tagManagerArgs);

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <App />
    </PersistGate>
  </Provider>,
);
