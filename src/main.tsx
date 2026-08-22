import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Handle stale Vite chunk loads, deployment mismatches, and IndexedDB closing events gracefully
if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', (event) => {
    console.warn('Vite preload error detected. Hard refreshing to load latest app bundle...');
    event.preventDefault();
    window.location.reload();
  });

  window.addEventListener('error', (event) => {
    const message = event?.message || '';
    if (message.includes('Database is closing') || message.includes('closing/hidden')) {
      // Benign IndexedDB closure when tab is backgrounded or iframe is unfocused
      event.preventDefault();
      return;
    }
    const isChunkLoadError = 
      message.includes('Failed to fetch dynamically imported module') ||
      message.includes('error loading dynamically imported module') ||
      message.includes('Importing a module script failed');
    if (isChunkLoadError) {
      console.warn('Chunk load failure detected. Hard refreshing app...');
      window.location.reload();
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event?.reason?.message || String(event?.reason || '');
    if (reason.includes('Database is closing') || reason.includes('closing/hidden')) {
      event.preventDefault();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

