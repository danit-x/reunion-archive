import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import App from './App';
import { StoreProvider } from './data/store';
import { ConfirmProvider, ToastProvider } from './components/feedback';
import './styles/tokens.css';
import './styles/base.css';
import './styles/site.css';
import './styles/pages.css';
import './styles/admin.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <MotionConfig reducedMotion="user">
        <StoreProvider>
          <ToastProvider>
            <ConfirmProvider>
              <App />
            </ConfirmProvider>
          </ToastProvider>
        </StoreProvider>
      </MotionConfig>
    </BrowserRouter>
  </StrictMode>,
);
