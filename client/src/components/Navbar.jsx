import React from "react";

const Navbar = ({ onConnectWallet, walletConnected }) => {
  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-500 p-5 text-white flex justify-between items-center shadow-lg">
      <h1 className="text-2xl font-bold">NFT App</h1>
      <button
        onClick={onConnectWallet}
        className="bg-blue-700 px-6 py-3 rounded-full text-lg font-semibold hover:bg-blue-800 cursor-pointer transition duration-300"
      >
        {walletConnected ? "Wallet Connected" : "Connect Wallet"}
      </button>
    </nav>
  );
};

export default Navbar;
