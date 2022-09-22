// Import Solana web3 functinalities
const {
  Connection,
  PublicKey,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
} = require('@solana/web3.js');

// Public key entered by the user
var inputWallet = process.argv[2];

// Connect to the Devnet
const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

console.log('Public key entered by the user', inputWallet);

// Get the wallet balance from a given address
const getWalletBalance = async () => {
  try {
    const walletBalance = await connection.getBalance(
      new PublicKey(inputWallet)
    );
    console.log(
      `Wallet balance: ${parseInt(walletBalance) / LAMPORTS_PER_SOL} SOL`
    );
  } catch (err) {
    console.log(err);
  }
};

const airDropSol = async () => {
  try {
    // Request airdrop of 2 SOL to the wallet
    console.log('Airdropping some SOL to the wallet!');
    const fromAirDropSignature = await connection.requestAirdrop(
      new PublicKey(inputWallet),
      2 * LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(fromAirDropSignature);
  } catch (err) {
    console.log(err);
  }
};

// Show the wallet balance before and after airdropping SOL
const mainFunction = async () => {
  await getWalletBalance();
  await airDropSol();
  await getWalletBalance();
};

mainFunction();
