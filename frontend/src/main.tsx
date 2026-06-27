import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './styles/globals.css';
import './i18n/config';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { initializeTheme } from './hooks/useTheme';

initializeTheme();

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
);