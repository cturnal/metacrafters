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

const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

// const newPair = Keypair.generate();
// console.log(newPair);

const DEMO_FROM_SECRET_KEY = new Uint8Array([
  58, 44, 66, 220, 104, 236, 219, 227, 136, 181, 88, 70, 1, 4, 20, 32, 21, 37,
  38, 112, 105, 226, 217, 71, 160, 46, 195, 53, 245, 29, 126, 79, 38, 46, 171,
  210, 173, 130, 214, 9, 177, 64, 160, 107, 194, 98, 238, 38, 107, 4, 157, 225,
  15, 87, 211, 22, 242, 226, 68, 23, 188, 55, 51, 122,
]);

// Get Keypair from Secret Key
var from = Keypair.fromSecretKey(DEMO_FROM_SECRET_KEY);

// Generate another Keypair (account we'll be sending to)
const to = Keypair.generate();

// Get the wallet balance from a given private key
const getWalletBalance = async (wallet) => {
  try {
    // Connect to the Devnet
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

    const walletBalance = await connection.getBalance(
      new PublicKey(wallet.publicKey)
    );
    return (balance = parseInt(walletBalance) / LAMPORTS_PER_SOL);
  } catch (err) {
    console.log(err);
  }
};

const airDropSol = async () => {
  try {
    console.log('');
    // Connect to the Devnet and make a wallet from privateKey
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

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
    console.log('');
  } catch (err) {
    console.log(err);
  }
};

const transferSol = async () => {
  const fromBalance = await getWalletBalance(from);
  const toSendFromBalance = fromBalance / 2;
  console.log('');

  console.log('Transfering 50% of the sender balance to the receiver wallet');
  // Send money from "from" wallet and into "to" wallet
  var transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: from.publicKey,
      toPubkey: to.publicKey,
      lamports: toSendFromBalance * LAMPORTS_PER_SOL,
    })
  );

  // Sign transaction
  var signature = await sendAndConfirmTransaction(connection, transaction, [
    from,
  ]);
  console.log('Transfer is completed, Signature is ', signature);
  console.log('');
};

const mainFunction = async () => {
  await getWalletBalance(from);
  console.log(`Sender Wallet Balance is ${balance}`);
  await getWalletBalance(to);
  console.log(`Receiver Wallet Balance is ${balance}`);

  await airDropSol();

  await getWalletBalance(from);
  console.log(`Sender New Wallet Balance is ${balance}`);
  await getWalletBalance(to);
  console.log(`Receiver New Wallet Balance is ${balance}`);

  await transferSol();

  await getWalletBalance(from);
  console.log(`Sender New Wallet Balance is ${balance}`);
  await getWalletBalance(to);
  console.log(`Receiver New Wallet Balance is ${balance}`);
};

mainFunction();
