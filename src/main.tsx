import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { NotificationProvider } from './context/NotificationContext.tsx';
import './index.css';
import { initLockAppZoom } from './utils/lockAppZoom';

initLockAppZoom();

createRoot(document.getElementById('root')!).render(
  <NotificationProvider>
    <App />
  </NotificationProvider>,
);
