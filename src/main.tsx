import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { registerSW } from 'virtual:pwa-register';

import 'primereact/resources/themes/lara-dark-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

const updateSW = registerSW({
  onNeedRefresh() {
    console.log('Nueva versión disponible. Recarga la página para actualizar.');
  },
  onOfflineReady() {
    console.log('La PWA está lista para usarse sin conexión.');
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);