import { Magic } from 'magic-sdk';
import { AvalancheExtension } from '@magic-ext/avalanche';
import { Avalanche, BinTools, Buffer, BN } from '@avalabs/avalanchejs';

import { MagicWallet } from "./MagicWallet";
import { CHAIN_DEFAULT, NETWORK } from "../constants/chains";
import { RPC_NODE_OPTIONS } from "../servcies/magic";

// // The EVM (Ethereum Virtual Machine) class extends the abstract MagicWallet class
// export class EVM extends MagicWallet {
//   // Web3 instance to interact with the Ethereum blockchain
//   web3Provider: Avalanche | null = null;

//   // The network for this class instance
//   public network: NETWORK;

//   constructor(network: NETWORK) {
//     super();
//     // Setting the network type
//     this.network = network;
//     // Calling the initialize method from MagicWallet
//     this.initialize();
//   }

//   // Asynchronous method to initialize the Web3 instance
//   async initializeWeb3(): Promise<void> {
//     const RPC_NODE = RPC_NODE_OPTIONS.find((n) => n.chainId === this.network);
//     // const provider = await this.magic?.wallet.getProvider(); // Get the provider from the magic
//     this.web3Provider = new Avalanche(RPC_NODE?.rpcUrl, 443, 'https', 4, 'X'); // Initializing the Web3 instance
//   }

// }
