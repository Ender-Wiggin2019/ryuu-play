import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';

import './styles.css';
import './lib/i18n';
import { FeedbackProvider } from './components/feedback-provider';
import { GlobalErrorListener } from './components/global-error-listener';
import { AuthProvider } from './lib/auth-context';
import { router } from './router';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider>
      <FeedbackProvider>
        <GlobalErrorListener />
        <RouterProvider router={router} />
      </FeedbackProvider>
    </AuthProvider>
  </React.StrictMode>
);
