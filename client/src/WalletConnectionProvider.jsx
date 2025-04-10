import React, { useMemo } from 'react';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import {
  WalletModalProvider,
} from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

export const WalletConnectionProvider = ({ children }) => {
  const network = 'devnet'; // Or 'mainnet-beta' / 'testnet'

  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    // Add more wallets here if needed
  ], [network]);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
