import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './index.css';

// Catch and suppress unhandled promise rejections originating from Vite's HMR WebSocket
function isBenignHmrError(str: string): boolean {
  if (!str) return false;
  const lower = str.toLowerCase();
  return (
    lower.includes('websocket') ||
    lower.includes('connection failed') ||
    lower.includes('closed without opened') ||
    lower.includes('vite') ||
    lower.includes('hmr') ||
    lower.includes('heartbeat')
  );
}

window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  let errorMsg = '';
  if (reason) {
    if (typeof reason === 'string') {
      errorMsg = reason;
    } else if (reason instanceof Error) {
      errorMsg = `${reason.name}: ${reason.message}\n${reason.stack || ''}`;
    } else {
      errorMsg = reason.message || String(reason);
    }
  }
  if (isBenignHmrError(errorMsg)) {
    event.preventDefault();
    event.stopPropagation();
    console.warn('Suppressed benign development HMR error:', errorMsg);
  }
});

// Also handle standard window errors for the same WebSocket connection issue
window.addEventListener('error', (event) => {
  const errorMsg = String(event.message || '');
  if (isBenignHmrError(errorMsg)) {
    event.preventDefault();
    event.stopPropagation();
    console.warn('Suppressed benign development HMR error:', errorMsg);
  }
}, true);

interface ErrorState {
  hasError: boolean;
  error: any | null;
  errorInfo: any | null;
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorState> {
  state: ErrorState = { hasError: false, error: null, errorInfo: null };

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    (this as any).setState({ errorInfo });
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', background: 'red', color: 'white', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999 }}>
          <h1>React Render Error</h1>
          <p>{this.state.error && this.state.error.toString()}</p>
          <pre>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
        </div>
      );
    }
    return (this as any).props.children;
  }
}

const container = document.getElementById('root');
if (!container) throw new Error('Root container missing');

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    for (let registration of registrations) {
      registration.unregister();
    }
  });
}

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);