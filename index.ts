import { processSenderKeypair } from './processSenderKeypair.ts';
import { establishConnection } from './establishConnection.ts';
import { simulateCheckout } from './simulateCheckout.ts';
import { simulateWalletInteraction } from './simulateWalletInteraction.ts';
import { encodeTransferRequestURL } from './encodeTransferRequestURL.ts';
import { findReference, FindReferenceError } from './findReference.ts';
import { validateTransfer } from './validateTransfer.ts';
import { TransferRequestURLFields } from '@solana/pay';
import { PublicKey } from '@solana/web3.js';

async function main() {
    console.log("RECIPIENT WALLET:")
    const RECIPIENT_WALLET = new PublicKey(process.argv[2] as string)
    console.log(`The public key is: `, RECIPIENT_WALLET.toBase58());
    
    console.log("SENDER WALLET:")
    const senderKeypair = processSenderKeypair()
    console.log(`The public key is: `, senderKeypair.publicKey.toBase58());

    console.log("Let's simulate a Solana Pay flow ... \n");
    let paymentStatus = ""

    console.log('1. ✅ Establish connection to the cluster');
    const connection = await establishConnection();
    console.log("Done")

    console.log('\n2. 🛍 Simulate a customer checkout \n');
    const { label, message, memo, amount, reference } = await simulateCheckout();

    /**
     * Create a payment request link
     *
     * Solana Pay uses a standard URL scheme across wallets for native SOL and SPL Token payments.
     * Several parameters are encoded within the link representing an intent to collect payment from a customer.
     */
    console.log('3. 💰 Create a payment request link \n');

    const transactionFields: TransferRequestURLFields = { recipient: RECIPIENT_WALLET, amount, reference, label, message, memo }
    const url = encodeTransferRequestURL(transactionFields);
    console.log(url)

    /**
     * Simulate wallet interaction
     *
     * This is only for example purposes. This interaction will be handled by a wallet provider
     */
    console.log('4. 🔐 Simulate wallet interaction \n');
    await simulateWalletInteraction(connection, url, senderKeypair);

    // Update payment status
    paymentStatus = 'pending';

    /**
     * Wait for payment to be confirmed
     *
     * When a customer approves the payment request in their wallet, this transaction exists on-chain.
     * You can use any references encoded into the payment link to find the exact transaction on-chain.
     * Important to note that we can only find the transaction when it's **confirmed**
     */
    console.log('\n5. Find the transaction');

    const signature: string = await new Promise((resolve, reject) => {
        /**
         * Retry until we find the transaction
         *
         * If a transaction with the given reference can't be found, the `findTransactionSignature`
         * function will throw an error. There are a few reasons why this could be a false negative:
         *
         * - Transaction is not yet confirmed
         * - Customer is yet to approve/complete the transaction
         *
         * You can implement a polling strategy to query for the transaction periodically.
         */
        const interval = setInterval(async () => {
            console.count('Checking for transaction...');
            try {
                let signatureInfo = await findReference(connection, reference, { finality: 'confirmed' });
                console.log('\n 🖌  Signature found: ', signatureInfo.signature);
                clearInterval(interval);
                resolve(signatureInfo.signature);
            } catch (error: any) {
                if (!(error instanceof FindReferenceError)) {
                    console.error(error);
                    clearInterval(interval);
                    reject(error);
                }
            }
        }, 250);
    });

    // Update payment status
    paymentStatus = 'confirmed';

    /**
     * Validate transaction
     *
     * Once the signature is returned,
     * it confirms that a transaction with reference to this order has been recorded on-chain.
     *
     * validateTransfer allows you to validate that the transaction signature
     * found matches the transaction that you expected.
     */
    console.log('\n6. 🔗 Validate transaction \n');

    try {
        await validateTransfer(connection, signature, { recipient: RECIPIENT_WALLET, amount });

        // Update payment status
        paymentStatus = 'validated';
        console.log('✅ Payment validated');
        console.log('📦 Ship order to customer');
    } catch (error) {
        console.error('❌ Payment failed', error);
    }
}

main().then(
    () => process.exit(),
    (err) => {
        console.error(err);
        process.exit(-1);
    }
);