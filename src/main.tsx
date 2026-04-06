import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Prevent libraries from overwriting window.fetch if it's a getter
try {
  const descriptor = Object.getOwnPropertyDescriptor(window, 'fetch');
  if (descriptor && !descriptor.writable && !descriptor.set) {
    console.log('window.fetch is a read-only getter, protecting it.');
    // We can't really do much if it's already a getter and not writable,
    // but we can try to define it as a non-configurable property if possible,
    // or just let the error happen and try to catch it earlier.
    // However, the error usually happens when a library does `window.fetch = ...`
  }
} catch (e) {
  console.error('Error checking window.fetch descriptor:', e);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
