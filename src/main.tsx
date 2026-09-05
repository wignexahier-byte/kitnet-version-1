import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AppProvider } from './context/AppContext.tsx';
import { ToastProvider } from './components/ui/Toast.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

// ---------------------------------------------------------------------------
// PWA & Service Worker Safety Guard:
// Prevent unexpected automatic page reloads caused by stale service workers,
// controllerchange events, unhandled promise rejections, or error listeners.
// ---------------------------------------------------------------------------
if (typeof window !== 'undefined') {
  // Prevent aggressive third-party / legacy SW auto-reloads
  if ('serviceWorker' in navigator) {
    try {
      navigator.serviceWorker.addEventListener('controllerchange', (e) => {
        // Log gracefully instead of calling location.reload()
        console.info('[PWA Guard] Service worker controller updated silently without forcing page reload.', e);
      });
    } catch {
      // Ignore
    }
  }

  // Global unhandled promise rejection guard
  window.addEventListener('unhandledrejection', (event) => {
    console.warn('[Global Guard] Handled unhandled promise rejection without reloading:', event.reason);
    // Prevent browser from treating this as a fatal crash
    event.preventDefault();
  });

  // Global error listener to log without refreshing
  window.addEventListener('error', (event) => {
    console.warn('[Global Guard] Handled window error gracefully without reloading:', event.error || event.message);
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AppProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AppProvider>
    </ErrorBoundary>
  </StrictMode>,
);
