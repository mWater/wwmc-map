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
  tileUrl: "https://{s}-api.mwater.co/v3/maps/tiles/{z}/{x}/{y}.png",
  gridUrl: "https://{s}-api.mwater.co/v3/maps/tiles/{z}/{x}/{y}.grid.json"
};

root.render(<App ctx={ctx} />);