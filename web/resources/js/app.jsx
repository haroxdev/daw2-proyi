import './bootstrap';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const mountEl = document.getElementById('app') || (() => {
  const d = document.createElement('div');
  d.id = 'app';
  document.body.appendChild(d);
  return d;
})();

createRoot(mountEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
