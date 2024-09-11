import { Keypair } from '@solana/web3.js';
import BigNumber from 'bignumber.js';

/**
 * Simulate a checkout experience
 *
 * Recommendation:
 * `amount` and `reference` should be created in a trusted environment (server).
 * The `reference` should be unique to a single customer session,
 * and will be used to find and validate the payment in the future.
 *
 * Read our [getting started guide](#getting-started-guide) for more information on what these parameters mean.
 */
export async function simulateCheckout() {
    return {
        label: "SOL Transfer",
        message: "Transfer of 0.05 SOL requested",
        memo: "SOL#1",
        amount: new BigNumber(.05),
        reference: new Keypair().publicKey,
    };
}