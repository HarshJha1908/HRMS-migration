// import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client';
// import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom';
import { MsalProvider } from '@azure/msal-react';
import { msalInstance, initializeMsal } from './auth/msalInstance';
// import { UserProvider } from './context/UserContext.tsx';

const root = ReactDOM.createRoot(document.getElementById('root')!);

// Initialize MSAL (handle redirect promise, set active account) BEFORE
// rendering the provider so child components see a ready instance.
initializeMsal()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('MSAL initialization failed', err);
  })
  .finally(() => {
    root.render(
      <MsalProvider instance={msalInstance}>
        <BrowserRouter>
          {/* <UserProvider> */}
          <App />
          {/* </UserProvider> */}
        </BrowserRouter>
      </MsalProvider>
    );
  });
