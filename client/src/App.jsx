import React, { useCallback, useState } from "react";
import { Connection, clusterApiUrl } from "@solana/web3.js";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { Metaplex, walletAdapterIdentity } from "@metaplex-foundation/js";
import "@solana/wallet-adapter-react-ui/styles.css";
import "./App.css"; // import custom global styling

const App = () => {
  const wallet = useWallet();
  const [mintedData, setMintedData] = useState(null);
  const [isMinting, setIsMinting] = useState(false);

  const handleMint = useCallback(async () => {
    if (!wallet.connected || !wallet.publicKey) {
      return alert("Connect wallet first");
    }

    setIsMinting(true);
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    const metaplex = Metaplex.make(connection).use(
      walletAdapterIdentity(wallet)
    );

    try {
      const { nft } = await metaplex.nfts().create({
        uri: "https://gateway.pinata.cloud/ipfs/bafkreifcj6cxi2nbdpdzoq2g66fbsedzlt2elxpsvzbrieejh5n6fa5oz4",
        name: "My Client NFT",
        sellerFeeBasisPoints: 500,
      });

      console.log("Minted NFT:", nft);
      setMintedData(nft);

      // Save to localStorage
      const existing = JSON.parse(localStorage.getItem("mintedNFTs") || "[]");
      const newList = [
        ...existing,
        {
          name: nft.name,
          address: nft.address.toBase58(),
          image: nft.json?.image,
          timestamp: new Date().toISOString(),
        },
      ];
      localStorage.setItem("mintedNFTs", JSON.stringify(newList));
    } catch (e) {
      console.error("Mint failed:", e);
      alert("Error minting NFT");
    } finally {
      setIsMinting(false);
    }
  }, [wallet]);

  return (
    <div className="app-container">
      <div className="content-box">
        <WalletMultiButton />
        <button
          onClick={handleMint}
          disabled={!wallet.connected || isMinting}
          className={`mint-button ${isMinting ? "disabled" : ""}`}
        >
          {isMinting ? "Minting..." : "Mint NFT"}
        </button>

        {mintedData && (
          <div className="mint-result">
            <p className="success">✅ NFT minted successfully!</p>
            <p>
              <strong>Mint Address:</strong>{" "}
              <a
                href={`https://explorer.solana.com/address/${mintedData.address.toBase58()}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {mintedData.address.toBase58()}
              </a>
            </p>
            <img
              src={mintedData.json?.image}
              alt={mintedData.name}
              className="nft-image"
            />
          </div>
        )}

        {typeof window !== "undefined" && (
          <div className="mint-history">
            <h3>Mint History</h3>
            {JSON.parse(localStorage.getItem("mintedNFTs") || "[]").map(
              (nft, idx) => (
                <div key={idx}>
                  <p>
                    <strong>#{idx + 1}</strong> -{" "}
                    <a
                      href={`https://explorer.solana.com/address/${nft.address}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {nft.address}
                    </a>
                  </p>
                  {nft.image && (
                    <img src={nft.image} alt="Minted NFT" width="120" />
                  )}
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const ContextProvider = ({ children }) => {
  const network = WalletAdapterNetwork.Devnet;
  const wallets = [new PhantomWalletAdapter()];

  return (
    <ConnectionProvider endpoint={clusterApiUrl(network)}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

const RootApp = () => (
  <ContextProvider>
    <App />
  </ContextProvider>
);

export default RootApp;
