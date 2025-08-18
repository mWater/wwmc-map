import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

const root = createRoot(container);

const ctx = {
  apiUrl: "https://api.mwater.co/v3/",
};

root.render(<App ctx={ctx} />);