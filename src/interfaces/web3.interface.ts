import { StargateClient } from "@cosmjs/stargate";
import { Signer as EVMSigner } from "ethers";
import { Connection as SolanaClient, Signer as SolSigner } from '@solana/web3.js';

export type Web3SignerType = EVMSigner // | SolSigner;