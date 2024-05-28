import { StargateClient } from "@cosmjs/stargate";
import { Signer as EVMSigner, ethers } from "ethers";
import { Connection as SolanaClient, Signer as SolSigner } from '@solana/web3.js';

export type Web3SignerType = ethers.Signer // | SolSigner;