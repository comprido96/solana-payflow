import type { Connection, Keypair } from '@solana/web3.js';
import { LAMPORTS_PER_SOL, sendAndConfirmTransaction } from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import type { TransferRequestURL } from "@solana/pay"
import { parseURL } from './encodeTransferRequestURL.js';
import { createTransfer } from './createTransfer.js';

export async function simulateWalletInteraction(connection: Connection, url: URL, senderKeypair: Keypair) {
    const { recipient, amount, reference, label, message, memo } = parseURL(url) as TransferRequestURL;
    
    console.log('label: ', label);
    console.log('message: ', message);

    const tx = await createTransfer(
        connection, senderKeypair.publicKey,
        {
            recipient: recipient, 
            amount: amount?? new BigNumber(.05 * LAMPORTS_PER_SOL),
            reference: reference, 
            memo: memo 
        }
    );    

    const sig = await sendAndConfirmTransaction(connection, tx, [senderKeypair]);
}