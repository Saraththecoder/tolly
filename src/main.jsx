import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import axios from 'axios';
import router from './routes';
import './index.css';

// Automatically inject admin passcode in requests
axios.interceptors.request.use((config) => {
  const passcode = sessionStorage.getItem('tolly_admin_passcode') || localStorage.getItem('tolly_admin_passcode');
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

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </HelmetProvider>
  </React.StrictMode>
);


