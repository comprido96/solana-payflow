import { Keypair } from "@solana/web3.js";
import { MERCHANT_WALLET, CUSTOMER_WALLET } from "./constants";
 

console.log("MERCHANT WALLET:")
console.log(`The public key is: `, MERCHANT_WALLET.toBase58());
console.log("CUSTOMER WALLET:") 
console.log(`The public key is: `, CUSTOMER_WALLET.publicKey.toBase58());
console.log(`The secret key is: `, CUSTOMER_WALLET.secretKey);
console.log(`✅ Finished!`);