import { clusterApiUrl, Connection } from '@solana/web3.js';

/**
 * Establish a connection to the cluster
 */
export async function establishConnection() {
    const endpoint = clusterApiUrl("devnet");
    const connection = new Connection(endpoint, 'confirmed');
    const version = await connection.getVersion();
    console.log('Connection to cluster established:', endpoint, version);

    return connection;
}