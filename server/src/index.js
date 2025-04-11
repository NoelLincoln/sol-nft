// const express = require("express");
// const cors = require("cors");
// const {
//   Connection,
//   Keypair,
//   LAMPORTS_PER_SOL,
//   Transaction,
//   SystemProgram,
//   sendAndConfirmTransaction,
//   PublicKey,
// } = require("@solana/web3.js");
// const bs58 = require("bs58");
// const app = express();
// const port = 5000;

// app.use(cors());
// app.use(express.json());

// // QuickNode devnet connection
// // const connection = new Connection(
// //   "https://alpha-tame-dinghy.solana-devnet.quiknode.pro/24f6b6225e2dee000e1a6e7f1afecbba8980decb/",
// //   "confirmed"
// // );

//  const connection = new Connection("https://api.devnet.solana.com", "confirmed");

// // const connection = new Connection("https://mainnet.helius-rpc.com/?api-key=9c13c71d-3088-4fc4-bc03-7c7a270b0bcd")

// // const connection = new Connection("https://devnet.helius-rpc.com/?api-key=9c13c71d-3088-4fc4-bc03-7c7a270b0bcd", "confirmed");

// // 🔑 Replace with your mint authority keypair (for now we generate new one if not loaded)
// const MINT_AUTHORITY = Keypair.generate();

// // Mint endpoint using QuickNode/Solana
// app.post("/mint", async (req, res) => {
//   try {
//     const { walletAddress } = req.body;

//     if (!walletAddress) {
//       return res.status(400).json({ error: "Missing wallet address" });
//     }

//     const recipientPubKey = new PublicKey(walletAddress);

//     // Airdrop 1 SOL to mint authority if needed (for devnet only)
//     const airdropSig = await connection.requestAirdrop(
//       MINT_AUTHORITY.publicKey,
//       LAMPORTS_PER_SOL
//     );
//     await connection.confirmTransaction(airdropSig, "confirmed");

//     // Send 0.1 SOL to recipient as a placeholder "mint"
//     const tx = new Transaction().add(
//       SystemProgram.transfer({
//         fromPubkey: MINT_AUTHORITY.publicKey,
//         toPubkey: recipientPubKey,
//         lamports: 0.1 * LAMPORTS_PER_SOL,
//       })
//     );

//     const signature = await sendAndConfirmTransaction(connection, tx, [
//       MINT_AUTHORITY,
//     ]);

//     console.log("Transaction Signature:", signature);

//     res.status(200).json({ success: true, signature });
//   } catch (err) {
//     console.error("Minting Error:", err);
//     res.status(500).json({ error: err.message || "Something went wrong" });
//   }
// });

// app.listen(port, () => {
//   console.log(`🚀 Server running at http://localhost:${port}`);
// });

const express = require("express");
const cors = require("cors");
const {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
} = require("@solana/web3.js");
const {
  createInitializeMintInstruction,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
  MINT_SIZE,
  getMinimumBalanceForRentExemptMint,
} = require("@solana/spl-token");
const {
  createCreateMetadataAccountV3Instruction,
  createCreateMasterEditionV3Instruction,
} = require("@metaplex-foundation/mpl-token-metadata");

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Solana devnet connection
const connection = new Connection(
  "https://alpha-tame-dinghy.solana-devnet.quiknode.pro/24f6b6225e2dee000e1a6e7f1afecbba8980decb/",
  "confirmed"
);

//  const connection = new Connection("https://api.devnet.solana.com", "confirmed");


app.post("/mint", async (req, res) => {
  try {
    const { walletAddress, name, symbol, uri } = req.body;

    if (!walletAddress || !name || !symbol || !uri) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const recipientPubKey = new PublicKey(walletAddress);

    // Airdrop 1 SOL to the recipient (for devnet only)
    const airdropSig = await connection.requestAirdrop(
      recipientPubKey,
      1e9 // 1 SOL
    );
    await connection.confirmTransaction(airdropSig, "confirmed");

    // Generate a new mint keypair for the NFT
    const mintKeypair = Keypair.generate();
    const mint = mintKeypair.publicKey;

    // Get the associated token account for the recipient
    const tokenAccount = await getAssociatedTokenAddress(mint, recipientPubKey);

    // Derive the metadata account PDA
    const [metadataPDA] = await PublicKey.findProgramAddress(
      [
        Buffer.from("metadata"),
        new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s").toBuffer(),
        mint.toBuffer(),
      ],
      new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s")
    );

    // Derive the master edition PDA
    const [masterEditionPDA] = await PublicKey.findProgramAddress(
      [
        Buffer.from("metadata"),
        new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s").toBuffer(),
        mint.toBuffer(),
        Buffer.from("edition"),
      ],
      new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s")
    );

    // Create the transaction for minting the NFT
    const transaction = new Transaction();

    // Add instructions to create the mint account
    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: recipientPubKey,
        newAccountPubkey: mint,
        space: MINT_SIZE,
        lamports: await getMinimumBalanceForRentExemptMint(connection),
        programId: TOKEN_PROGRAM_ID,
      }),

      createInitializeMintInstruction(
        mint,
        0, // NFTs have 0 decimals
        recipientPubKey, // Set the recipient's wallet as the mint authority
        recipientPubKey // Set the recipient's wallet as the freeze authority
      ),

      createAssociatedTokenAccountInstruction(
        recipientPubKey,
        tokenAccount,
        recipientPubKey,
        mint
      ),

      createMintToInstruction(
        mint,
        tokenAccount,
        recipientPubKey, // Use the recipient's wallet as the mint authority
        1 // Mint 1 token (NFT)
      ),

      createCreateMetadataAccountV3Instruction(
        {
          metadata: metadataPDA,
          mint: mint,
          mintAuthority: recipientPubKey, // Use the recipient's wallet as the mint authority
          payer: recipientPubKey,
          updateAuthority: recipientPubKey, // Use the recipient's wallet as the update authority
        },
        {
          createMetadataAccountArgsV3: {
            data: {
              name: name,
              symbol: symbol,
              uri: uri,
              sellerFeeBasisPoints: 500, // 5% royalties
              creators: null,
            },
            isMutable: true,
          },
        }
      ),

      createCreateMasterEditionV3Instruction(
        {
          edition: masterEditionPDA,
          mint: mint,
          mintAuthority: recipientPubKey, // Use the recipient's wallet as the mint authority
          payer: recipientPubKey,
          updateAuthority: recipientPubKey, // Use the recipient's wallet as the update authority
          metadata: metadataPDA,
        },
        {
          createMasterEditionArgs: {
            maxSupply: 0, // Unlimited supply
          },
        }
      )
    );

    // Sign and send the transaction
    transaction.feePayer = recipientPubKey;
    const blockhash = await connection.getRecentBlockhash();
    transaction.recentBlockhash = blockhash.blockhash;

    transaction.partialSign(mintKeypair);

    const signature = await sendAndConfirmTransaction(connection, transaction, [
      mintKeypair,
    ]);

    console.log("NFT Minted! Transaction Signature:", signature);

    res.status(200).json({
      success: true,
      signature,
      mint: mint.toString(),
      tokenAccount: tokenAccount.toString(),
    });
  } catch (err) {
    console.error("Minting Error:", err);
    res.status(500).json({ error: err.message || "Something went wrong" });
  }
});

const metadata = require('@metaplex-foundation/mpl-token-metadata');
console.log(Object.keys(metadata));

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
