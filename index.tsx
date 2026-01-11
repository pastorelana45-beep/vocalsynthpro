import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// --- AGGIUNTA PER FUNZIONE INSTALLA ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Usiamo un Service Worker minimale "inline" per attivare i requisiti PWA
    navigator.serviceWorker.register('data:text/javascript;base64,c2VsZi5hZGRFdmVudExpc3RlbmVyKCdmZXRjaCcsICgpID0+IHt9KTs=')
      .then(() => console.log("PWA: Pronto per l'installazione"))
      .catch(err => console.error("PWA: Errore", err));
  });
}
// ---------------------------------------

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
