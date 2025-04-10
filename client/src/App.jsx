import React, { useState } from "react";
import { Buffer } from "buffer";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Navbar from "./components/Navbar";
import { clusterApiUrl, Connection, Transaction } from "@solana/web3.js";
// Ensure Buffer is available globally
window.Buffer = window.Buffer || Buffer;

const App = () => {
  const { connected, publicKey, signTransaction } = useWallet();
  const [mintInfo, setMintInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  const handleMint = async () => {
    if (!connected || !publicKey) {
      alert("Connect wallet first");
      console.log("Wallet not connected or publicKey is missing.");
      return;
    }
  
    setLoading(true);
    console.log("Starting mint process...");
  
    try {
      const response = await fetch("http://localhost:5000/mint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: publicKey.toString() }),
      });
  
      if (!response.ok) {
        throw new Error(`Backend request failed with status: ${response.status}`);
      }
  
      const result = await response.json();
      console.log("Backend response:", result);
  
      if (result.transaction) {
        const transaction = Transaction.from(Buffer.from(result.transaction, "base64"));
        console.log("Transaction deserialized:", transaction);
  
        // Ensure feePayer and recentBlockhash are set
        transaction.feePayer = publicKey;
        const { blockhash } = await connection.getRecentBlockhash();
        transaction.recentBlockhash = blockhash;
  
        // Log public key and check signatures before signing
        console.log("Wallet Public Key: ", publicKey.toString());
        console.log("Transaction Signatures before signing:", transaction.signatures);
  
        // Sign the transaction with Phantom Wallet
        const signedTransaction = await signTransaction(transaction);
        console.log("Transaction signed with signature:", signedTransaction.signatures);
  
        // Log signatures after signing
        console.log("Transaction Signatures after signing:", signedTransaction.signatures);
  
        // Send the signed transaction
        const signature = await connection.sendRawTransaction(signedTransaction.serialize());
        await connection.confirmTransaction(signature);
        console.log("Transaction confirmed!");
  
        setMintInfo({
          mint: result.mint,
          tokenAccount: result.tokenAccount,
          transaction: result.transaction,
          signature: signature,
        });
  
        alert("Minting successful!");
      } else {
        console.log("No transaction data found in result.");
        alert("Minting failed. Please check the console for details.");
      }
    } catch (error) {
      console.error("Minting error:", error);
      alert("An error occurred during minting. Please try again.");
    } finally {
      setLoading(false);
      console.log("Mint process completed.");
    }
  };
  

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-6 flex flex-col items-center">
        <div className="mb-4">
          <WalletMultiButton />
        </div>

        {connected && publicKey && (
          <>
            <div className="mb-4 text-green-600 font-semibold">
              Wallet Connected: {publicKey.toString()}
            </div>
            <button
              onClick={handleMint}
              className={`bg-green-500 text-white px-6 py-3 rounded-full shadow-lg transform transition duration-300 hover:bg-green-700 hover:scale-105 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              {loading ? "Minting..." : "Mint NFT"}
            </button>
          </>
        )}

        {mintInfo && (
          <div className="mt-6 text-lg bg-white p-4 rounded-lg shadow-md">
            <p className="text-green-600 font-bold">Minted successfully!</p>
            <p>
              <span className="font-semibold">Mint Address:</span>{" "}
              <span className="font-mono">{mintInfo.mint}</span>
            </p>
            <p>
              <span className="font-semibold">Token Account:</span>{" "}
              <span className="font-mono">{mintInfo.tokenAccount}</span>
            </p>
            <p>
              <span className="font-semibold">Transaction (Base64):</span>{" "}
              <span className="font-mono break-all">
                {mintInfo.transaction}
              </span>
            </p>
            <p>
              <span className="font-semibold">Transaction Signature:</span>{" "}
              <span className="font-mono">{mintInfo.signature}</span>
            </p>
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
