import { createRoot } from 'react-dom/client';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';

import App from './container/App';

const container = document.createElement('div');
container.id = 'chakra-shadow-app';
document.body.appendChild(container);

const shadowRoot = container.attachShadow({ mode: 'open' });

const styleElement = document.createElement('style');
shadowRoot.appendChild(styleElement);

const shadowCache = createCache({
  key: 'chakra-shadow',
  container: styleElement,
});

const root = createRoot(shadowRoot);
root.render(
  <CacheProvider value={shadowCache}>
    <App />
  </CacheProvider>
);