const express = require("express");
const { Connection, PublicKey, LAMPORTS_PER_SOL } = require("@solana/web3.js");
const {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} = require("@solana/spl-token");

const { Keypair } = require("@solana/web3.js"); // Import Keypair

const app = express();
const port = 5000;

const connection = new Connection("https://alpha-tame-dinghy.solana-devnet.quiknode.pro/24f6b6225e2dee000e1a6e7f1afecbba8980decb/", "confirmed");
// const connection = new Connection("https://api.devnet.solana.com", "confirmed");
app.use(express.json());

const cors = require("cors");
app.use(cors());

async function requestAirdropWithRetry(walletPublicKey) {
  try {
    const airdropSignature = await connection.requestAirdrop(walletPublicKey, LAMPORTS_PER_SOL);
    await connection.confirmTransaction(airdropSignature);
    console.log("Airdrop successful!");
  } catch (error) {
    console.error("Error during airdrop:", error);
  }
}

app.post("/mint", async (req, res) => {
  const { walletAddress } = req.body;

  if (!walletAddress) {
    return res.status(400).json({ error: "Wallet address is required" });
  }

  try {
    const walletPublicKey = new PublicKey(walletAddress);
    console.log("Received wallet address:", walletPublicKey.toString());

    const balance = await connection.getBalance(walletPublicKey);
    console.log("Current balance:", balance);

    if (balance < LAMPORTS_PER_SOL) {
      await requestAirdropWithRetry(walletPublicKey);
    }

    // Generate a temporary Keypair for minting
    const payer = Keypair.generate();

    // Airdrop SOL to the payer to cover transaction fees
    const airdropSignature = await connection.requestAirdrop(
      payer.publicKey,
      LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(airdropSignature);

    const mint = await createMint(
      connection,
      payer, // Use the payer Keypair as the signer
      payer.publicKey,
      null,
      9
    );
    console.log("Created mint:", mint.toString());

    const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      payer, // Use the payer Keypair as the signer
      mint,
      walletPublicKey
    );

    console.log("Created token account:", fromTokenAccount.address.toString());

    const signature = await mintTo(
      connection,
      payer, // Use the payer Keypair as the signer
      mint,
      fromTokenAccount.address,
      payer.publicKey,
      10000000000
    );

    res.status(200).json({ signature });
  } catch (error) {
    console.error("Error during minting:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
