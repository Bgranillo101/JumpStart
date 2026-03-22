import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../css/index.css';
import '../css/components.css';
import { WizardProvider } from './context/WizardContext';
import { AuthProvider } from './context/AuthContext';
import App from './App';

// Apply persisted theme before render to prevent flash
const storedTheme = localStorage.getItem('jumpstart_theme');
if (storedTheme === 'light') {
  document.documentElement.setAttribute('data-theme', 'light');
}

createRoot(document.getElementById('landing')!).render(
  <StrictMode>
    <AuthProvider>
      <WizardProvider>
        <App />
      </WizardProvider>
    </AuthProvider>
  </StrictMode>,
);
