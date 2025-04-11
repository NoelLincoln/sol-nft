// import { StrictMode } from 'react';
// import { createRoot } from 'react-dom/client';
// import './index.css';
// import App from './App.jsx';
// import { WalletConnectionProvider } from './WalletConnectionProvider';
// import '@solana/wallet-adapter-react-ui/styles.css';
// import { Buffer } from "buffer";

// // Ensure Buffer is available globally
// window.Buffer = window.Buffer || Buffer;

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <WalletConnectionProvider>
//       <App />
//     </WalletConnectionProvider>
//   </StrictMode>,
// );


// main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "@solana/wallet-adapter-react-ui/styles.css";

import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import {
  PhantomWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";

const wallets = [new PhantomWalletAdapter()];
const network = "https://api.devnet.solana.com";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ConnectionProvider endpoint={network}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <App />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  </React.StrictMode>
);
