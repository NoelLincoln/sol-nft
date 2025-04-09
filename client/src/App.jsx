import React, { useState } from "react";
import Navbar from "./components/Navbar";

const App = () => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);
  const [mintInfo, setMintInfo] = useState(null); // State to hold mint info

  const connectWallet = async () => {
    if (window.solana && window.solana.isPhantom) {
      try {
        await window.solana.connect();
        setWalletConnected(true);
        setWalletAddress(window.solana.publicKey.toString());
      } catch (error) {
        console.error("Error connecting wallet:", error);
      }
    } else {
      alert("Please install Phantom wallet");
    }
  };

  const handleMint = async () => {
    if (!walletConnected) return alert("Connect wallet first");

    try {
      const response = await fetch("http://localhost:5000/mint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress }),
      });

      const result = await response.json();
      console.log("Mint result:", result);

      if (result.signature) {
        setMintInfo({
          mint: result.signature, // Mint address from the response
          tokenAccount: result.tokenAccount || "Not available", // You can append token account info if returned
        });
      }
    } catch (error) {
      console.error("Minting error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar onConnectWallet={connectWallet} walletConnected={walletConnected} />
      <div className="p-6 flex flex-col items-center">
        {walletConnected && (
          <div className="mb-4 text-green-600 font-semibold">
            Wallet Connected: {walletAddress}
          </div>
        )}
        {walletConnected && (
          <button
            onClick={handleMint}
            className="bg-green-500 text-white px-6 py-3 rounded-full shadow-lg transform transition duration-300 hover:bg-green-700 hover:scale-105"
          >
            Mint NFT
          </button>
        )}

        {mintInfo && (
          <div className="mt-6 text-lg">
            <p className="text-green-600">Minted successfully!</p>
            <p>Created mint: <span className="font-bold">{mintInfo.mint}</span></p>
            <p>Created token account: <span className="font-bold">{mintInfo.tokenAccount}</span></p>
          </div>
        )}

        <div className="flex flex-wrap justify-center p-6 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="max-w-xs mx-4 my-4 bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-xl"
            >
              <img
                className="w-full h-48 object-cover rounded-t-lg"
                src={`https://picsum.photos/200/300?random=${index}`}
                alt="NFT"
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  NFT #{index + 1}
                </h3>
                <p className="text-gray-500">This is a random NFT card.</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
