import { Amount, Label, Memo, Message, Recipient, Reference, SPLToken, TransferRequestURLFields } from "@solana/pay";
import { PublicKey } from "@solana/web3.js";
import BigNumber from "bignumber.js";

const SOLANA_PROTOCOL = 'solana:';

export function encodeTransferRequestURL({
    recipient,
    amount,
    splToken,
    reference,
    label,
    message,
    memo,
}: TransferRequestURLFields): URL {
    const pathname = recipient.toBase58();
    const url = new URL(SOLANA_PROTOCOL + pathname);

    if (amount) {
        url.searchParams.append('amount', amount.toFixed(amount.decimalPlaces() ?? 0));
    }

    if (splToken) {
        url.searchParams.append('spl-token', splToken.toBase58());
    }

    if (reference) {
        if (!Array.isArray(reference)) {
            reference = [reference];
        }

        for (const pubkey of reference) {
            url.searchParams.append('reference', pubkey.toBase58());
        }
    }

    if (label) {
        url.searchParams.append('label', label);
    }

    if (message) {
        url.searchParams.append('message', message);
    }

    if (memo) {
        url.searchParams.append('memo', memo);
    }

    return url;
}

/**
 * A Solana Pay transfer request URL.
 */
export interface TransferRequestURL {
    /** `recipient` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#recipient). */
    recipient: Recipient;
    /** `amount` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#amount). */
    amount: Amount | undefined;
    /** `spl-token` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#spl-token). */
    splToken: SPLToken | undefined;
    /** `reference` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#reference). */
    reference: Reference[] | undefined;
    /** `label` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#label). */
    label: Label | undefined;
    /** `message` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#message). */
    message: Message | undefined;
    /** `memo` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#memo). */
    memo: Memo | undefined;
}

/**
 * Thrown when a URL can't be parsed as a Solana Pay URL.
 */
export class ParseURLError extends Error {
    name = 'ParseURLError';
}

/**
 * Parse a Solana Pay URL.
 *
 * @param url - URL to parse.
 *
 * @throws {ParseURLError}
 */
export function parseURL(url: string | URL): TransferRequestURL {
    if (typeof url === 'string') {
        if (url.length > 2048) throw new ParseURLError('length invalid');
        url = new URL(url);
    }

    if (url.protocol !== SOLANA_PROTOCOL) throw new ParseURLError('protocol invalid');
    if (!url.pathname) throw new ParseURLError('pathname missing');

    return parseTransferRequestURL(url);
}


function parseTransferRequestURL({ pathname, searchParams }: URL): TransferRequestURL {
    let recipient: PublicKey;
    try {
        recipient = new PublicKey(pathname);
    } catch (error: any) {
        throw new ParseURLError('recipient invalid');
    }

    let amount: BigNumber | undefined;
    const amountParam = searchParams.get('amount');
    if (amountParam != null) {
        if (!/^\d+(\.\d+)?$/.test(amountParam)) throw new ParseURLError('amount invalid');

        amount = new BigNumber(amountParam);
        if (amount.isNaN()) throw new ParseURLError('amount NaN');
        if (amount.isNegative()) throw new ParseURLError('amount negative');
    }

    let splToken: PublicKey | undefined;
    const splTokenParam = searchParams.get('spl-token');
    if (splTokenParam != null) {
        try {
            splToken = new PublicKey(splTokenParam);
        } catch (error) {
            throw new ParseURLError('spl-token invalid');
        }
    }

    let reference: PublicKey[] | undefined;
    const referenceParams = searchParams.getAll('reference');
    if (referenceParams.length) {
        try {
            reference = referenceParams.map((reference) => new PublicKey(reference));
        } catch (error) {
            throw new ParseURLError('reference invalid');
        }
    }

    const label = searchParams.get('label') || undefined;
    const message = searchParams.get('message') || undefined;
    const memo = searchParams.get('memo') || undefined;

    return {
        recipient,
        amount,
        splToken,
        reference,
        label,
        message,
        memo,
    };
}