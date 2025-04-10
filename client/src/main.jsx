import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { WalletConnectionProvider } from './WalletConnectionProvider';
import '@solana/wallet-adapter-react-ui/styles.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WalletConnectionProvider>
      <App />
    </WalletConnectionProvider>
  </StrictMode>,
);
