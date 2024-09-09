import { Keypair, PublicKey } from '@solana/web3.js';

export const MERCHANT_WALLET = new PublicKey('36vqn1tAJrWC6DcxZtKp7wpTqtP6jhr2DDJJbjs6AUUY');

// Keypair purely for testing purposes. Exists only on devnet
export const CUSTOMER_WALLET = Keypair.fromSecretKey(
    Uint8Array.from([96,111,199,107,49,137,181,2,227,114,65,233,63,192,252,190,224,93,152,28,79,85,118,108,161,163,198,92,17,132,17,122,213,12,48,104,148,111,188,236,61,106,182,131,38,206,239,16,244,209,206,158,35,109,226,149,165,144,94,168,103,248,91,108])
);