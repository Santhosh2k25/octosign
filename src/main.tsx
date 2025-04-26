import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import { DocumentProvider } from './contexts/DocumentContext';
import { NotificationProvider } from './contexts/NotificationContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <DocumentProvider>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </DocumentProvider>
    </AuthProvider>
  </StrictMode>
);