import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter } from 'react-router-dom';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import keycloak from './services/keycloak.ts';

createRoot(document.getElementById('root')!).render(
  <ReactKeycloakProvider authClient={keycloak}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ReactKeycloakProvider>,
)
