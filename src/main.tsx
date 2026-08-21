import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Handle stale Vite chunk loads and deployment mismatches gracefully
if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', (event) => {
    console.warn('Vite preload error detected. Hard refreshing to load latest app bundle...');
    event.preventDefault();
    window.location.reload();
  });

  window.addEventListener('error', (event) => {
    const isChunkLoadError = 
      event?.message?.includes('Failed to fetch dynamically imported module') ||
      event?.message?.includes('error loading dynamically imported module') ||
      event?.message?.includes('Importing a module script failed');
    if (isChunkLoadError) {
      console.warn('Chunk load failure detected. Hard refreshing app...');
      window.location.reload();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

