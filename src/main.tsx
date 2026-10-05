import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary';

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    document.body.innerHTML = '<div style="color:red;padding:20px;text-align:center;">Root element not found</div>';
  } else {
    const root = createRoot(rootElement);
    root.render(
      <StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </StrictMode>
    );
  }
} catch (err: any) {
  console.error('Fatal initialization error:', err);
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="direction:rtl;padding:30px;text-align:center;font-family:sans-serif;">
        <h2 style="color:#e11d48;">خطأ في تشغيل الموقع:</h2>
        <pre style="text-align:left;background:#fee2e2;padding:15px;border-radius:10px;font-size:12px;overflow:auto;">${err?.stack || err?.message || err}</pre>
        <button onclick="location.reload()" style="margin-top:15px;padding:10px 20px;background:#4f46e5;color:white;border:none;border-radius:8px;cursor:pointer;">إعادة المحاولة</button>
      </div>
    `;
  }
}
