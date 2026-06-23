import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import axios from 'axios';
import router from './routes';
import ErrorBoundary from './components/ErrorBoundary'; // FIXED: #9
import './index.css';

// Automatically inject admin passcode in requests
// Only use sessionStorage (clears on tab/browser close) — never localStorage
// Also nuke any old localStorage token left from previous insecure version
localStorage.removeItem('tolly_admin_passcode');

axios.interceptors.request.use((config) => {
  const passcode = sessionStorage.getItem('tolly_admin_passcode');
  if (passcode) {
    config.headers['X-Admin-Passcode'] = passcode;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

const rootEl = document.getElementById('root');

const app = (
  <React.StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

// FIXED: #1 — Use hydrateRoot when react-snap has pre-rendered HTML,
// otherwise fall back to createRoot for normal SPA mode
if (rootEl.hasChildNodes()) {
  ReactDOM.hydrateRoot(rootEl, app);
} else {
  ReactDOM.createRoot(rootEl).render(app);
}
