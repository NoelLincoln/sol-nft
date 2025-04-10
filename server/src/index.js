const express = require("express");
// const { Connection, PublicKey, LAMPORTS_PER_SOL } = require("@solana/web3.js");
const {
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  Keypair,
  Transaction,
  SystemProgram,
} = require("@solana/web3.js");

const {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  getAssociatedTokenAddress,
  createInitializeMintInstruction,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  TOKEN_PROGRAM_ID,
  MINT_SIZE,
  getMinimumBalanceForRentExemptMint,
} = require("@solana/spl-token");

const app = express();
const port = 5000;

const connection = new Connection(
  "https://alpha-tame-dinghy.solana-devnet.quiknode.pro/24f6b6225e2dee000e1a6e7f1afecbba8980decb/",
  "confirmed"
);
// const connection = new Connection("https://api.devnet.solana.com", "confirmed");
app.use(express.json());

const cors = require("cors");
app.use(cors());

async function requestAirdropWithRetry(walletPublicKey) {
  try {
    const airdropSignature = await connection.requestAirdrop(
      walletPublicKey,
      LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(airdropSignature);
    console.log("Airdrop successful!");
  } catch (error) {
    console.error("Error during airdrop:", error);
  }
}
//   const { walletAddress } = req.body;

//   if (!walletAddress) {
//     return res.status(400).json({ error: "Wallet address is required" });
//   }

//   try {
//     const walletPublicKey = new PublicKey(walletAddress);
//     console.log("Received wallet address:", walletPublicKey.toString());

//     const balance = await connection.getBalance(walletPublicKey);
//     console.log("Current balance:", balance);

//     if (balance < LAMPORTS_PER_SOL) {
//       await requestAirdropWithRetry(walletPublicKey);
//     }

//     // Generate a temporary Keypair for minting
//     const payer = Keypair.generate();

//     // Airdrop SOL to the payer to cover transaction fees
//     const airdropSignature = await connection.requestAirdrop(
//       payer.publicKey,
//       LAMPORTS_PER_SOL
//     );
//     await connection.confirmTransaction(airdropSignature);

//     const mint = await createMint(
//       connection,
//       payer, // Use the payer Keypair as the signer
//       payer.publicKey,
//       null,
//       9
//     );
//     console.log("Created mint:", mint.toString());

//     const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
//       connection,
//       payer, // Use the payer Keypair as the signer
//       mint,
//       walletPublicKey
//     );

//     console.log("Created token account:", fromTokenAccount.address.toString());

//     const signature = await mintTo(
//       connection,
//       payer, // Use the payer Keypair as the signer
//       mint,
//       fromTokenAccount.address,
//       payer.publicKey,
//       10000000000
//     );

//     res.status(200).json({ signature });
//   } catch (error) {
//     console.error("Error during minting:", error);
//     res.status(500).json({ error: error.message });
//   }
// });

app.post("/mint", async (req, res) => {
  try {
    const { walletAddress } = req.body;
    const walletPublicKey = new PublicKey(walletAddress);

    const mintKeypair = Keypair.generate(); // new mint
    const mint = mintKeypair.publicKey;

    const tokenAccount = await getAssociatedTokenAddress(mint, walletPublicKey);

    const transaction = new Transaction();

    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: walletPublicKey,
        newAccountPubkey: mint,
        space: MINT_SIZE,
        lamports: await getMinimumBalanceForRentExemptMint(connection),
        programId: TOKEN_PROGRAM_ID,
      }),
      createInitializeMintInstruction(
        mint,
        9,
        walletPublicKey, // mint authority = user
        walletPublicKey
      ),
      createAssociatedTokenAccountInstruction(
        walletPublicKey,
        tokenAccount,
        walletPublicKey,
        mint
      ),
      createMintToInstruction(
        mint,
        tokenAccount,
        walletPublicKey, // user signs
        10000000000
      )
    );

    transaction.feePayer = walletPublicKey;
    const blockhash = await connection.getRecentBlockhash();
    transaction.recentBlockhash = blockhash.blockhash;

    // Return unsigned transaction and mint address
    res.status(200).json({
      transaction: transaction
        .serialize({ requireAllSignatures: false })
        .toString("base64"),
      mint: mint.toString(),
      tokenAccount: tokenAccount.toString(),
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
