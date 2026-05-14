import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <GoogleOAuthProvider 
    clientId={import.meta.env.VITE_GOOGLE_API_TOKEN}>
      <App />
    </GoogleOAuthProvider>
  </BrowserRouter>
);
