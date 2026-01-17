import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { reportWebVitals } from './utils/performance';
import './styles/App.css';
import './styles/improvements.css';

// Инициализация метрик производительности
if (process.env.NODE_ENV === 'production') {
  reportWebVitals(console.log);
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
