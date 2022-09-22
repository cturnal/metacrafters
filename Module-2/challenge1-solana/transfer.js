// Import Solana web3 functinalities
const {
  Connection,
  PublicKey,
  clusterApiUrl,
  Keypair,
  LAMPORTS_PER_SOL,
  Transaction,
  SystemProgram,
  sendAndConfirmRawTransaction,
  sendAndConfirmTransaction,
} = require('@solana/web3.js');

const DEMO_FROM_SECRET_KEY = new Uint8Array([
  27, 214, 168, 211, 216, 55, 35, 121, 97, 201, 157, 147, 229, 3, 199, 152, 248,
  74, 167, 236, 163, 14, 28, 105, 167, 91, 122, 249, 188, 148, 96, 64, 122, 175,
  211, 233, 248, 228, 65, 190, 196, 46, 99, 33, 29, 174, 104, 182, 153, 196,
  111, 141, 95, 89, 111, 120, 114, 119, 41, 100, 33, 162, 224, 126,
]);

// Get Keypair from Secret Key
var from = Keypair.fromSecretKey(DEMO_FROM_SECRET_KEY);

// Generate another Keypair (account we'll be sending to)
const to = Keypair.generate();

const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

// Get the wallet balance from a given address
const getWalletBalance = async () => {
  try {
    // get balance of from wallet
    const fromWalletBalance = await connection.getBalance(from.publicKey);
    console.log(
      `from Wallet balance: ${
        parseInt(fromWalletBalance) / LAMPORTS_PER_SOL
      } SOL`
    );

    // get balance of to wallet
    const toWalletBalance = await connection.getBalance(to.publicKey);
    console.log(
      `to Wallet balance: ${parseInt(toWalletBalance) / LAMPORTS_PER_SOL} SOL`
    );
  } catch (err) {
    console.log(err);
  }
};

const transferSol = async () => {
  await getWalletBalance();

  // Aidrop 2 SOL to Sender wallet
  console.log('Airdopping some SOL to Sender wallet!');
  const fromAirDropSignature = await connection.requestAirdrop(
    new PublicKey(from.publicKey),
    2 * LAMPORTS_PER_SOL
  );

  // Latest blockhash (unique identifer of the block) of the cluster
  let latestBlockHash = await connection.getLatestBlockhash();

  // Confirm transaction using the last valid block height (refers to its time)
  // to check for transaction expiration
  await connection.confirmTransaction({
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    signature: fromAirDropSignature,
  });

  console.log('Airdrop completed for the Sender account');

  await getWalletBalance();

  // Send money from "from" wallet and into "to" wallet
  var transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: from.publicKey,
      toPubkey: to.publicKey,
      lamports: LAMPORTS_PER_SOL / 100,
    })
  );

  // Sign transaction
  var signature = await sendAndConfirmTransaction(connection, transaction, [
    from,
  ]);
  console.log('Signature is ', signature);
  await getWalletBalance();
};

transferSol();
