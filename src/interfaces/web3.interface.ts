import { StargateClient } from "@cosmjs/stargate";
import { ethers } from "ethers";
import { Connection as SolanaClient } from '@solana/web3.js';

export type Web3ProviderType = ethers.providers.Web3Provider | StargateClient | SolanaClient; // | Avalanche;
