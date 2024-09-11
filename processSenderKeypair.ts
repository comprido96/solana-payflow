import { Keypair } from "@solana/web3.js"
import fs from "fs"

export function processSenderKeypair() {
    const senderKey = JSON.parse(fs.readFileSync("key.json").toString()) as number[];
    if (!senderKey) throw new Error("SENDER_KEY not found")
 
    console.log(senderKey)
    return Keypair.fromSecretKey(Uint8Array.from(senderKey))
  }