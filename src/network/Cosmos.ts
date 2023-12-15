import { SDKBase } from "@magic-sdk/provider"
import { CosmosExtension } from '@magic-ext/cosmos';
import { StargateClient } from '@cosmjs/stargate';

import { MagicWalletUtils } from "./MagicWallet";
import { CHAIN_DEFAULT, NETWORK } from "../constants/chains";
import { RPC_NODE_OPTIONS, getMagic } from "../servcies/magic";
import { IAsset } from "../interfaces/asset.interface";

// // The EVM (Ethereum Virtual Machine) class extends the abstract MagicWallet class
// export class Cosmos extends MagicWallet {
//   // Web3 instance to interact with the Ethereum blockchain
//   web3Provider: StargateClient|null = null;

//   // The network for this class instance
//   public network: NETWORK;

//   public assets: IAsset[] = [];

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
//     if (!RPC_NODE) {
//       throw new Error("RPC Node config fail. Incorect params, ");
//     }
//     this.web3Provider = await StargateClient.connect(RPC_NODE?.rpcUrl);
//   }

//   public override async connect() {
//     // prompt to get email 
//     const email = prompt('Enter your email');
//     if (!email) {
//       throw new Error("User not logged in");
//     }
//     try {
//       await this.loginWithOTP(email);
//       const infos = await this.getInfo();
//       console.log("connect infos", infos);
//       this.walletAddress = infos?.publicAddress;
//       // this.assets = await this._fetchUserAssets();
//     } catch (error) {
//       console.log("connect error", error);      
//     }
//   }

//   protected async _fetchUserAssets(): Promise<IAsset[]> {
//     return [];
//     // const { publicAddress } = (await this.getInfo()) || {};
//     // if (!publicAddress) return [];
//     // const assets = await fetchUserAssets(publicAddress);
//     // if (!assets) return [];
//     // return assets;
//   }
  

//   public async sendTx(ops: {
//     toAddress: string;
//     amount: number;
//   }): Promise<any> {
//     if (!this.walletAddress) {
//       throw new Error("User not logged in");
//     }
//     const {toAddress, amount } = ops;
//     const message = [
//       {
//         typeUrl: '/cosmos.bank.v1beta1.MsgSend',
//         value: {
//           fromAddress: this.walletAddress,
//           toAddress,
//           amount: [
//             {
//               amount: String(amount),
//               denom: 'atom',
//             },
//           ],
//         },
//       },
//     ];
//     const fee = {
//       amount: [{ denom: 'uatom', amount: '500' }],
//       gas: '200000',
//     };
//     if (!this._magicExtention) {
//       throw new Error("Magic extention not found");
//     }
//     const signTransactionResult = await this._magicExtention.sign(message, fee);
//     console.log('signTransactionResult', signTransactionResult);
//     return signTransactionResult;
//   }
// }

/**
 * Cosmos Wallet Utils
 * Support for Cosmos Wallet
 * StargateClient docs: https://cosmos.github.io/cosmjs/latest/stargate/classes/StargateClient.html
 */
export class CosmosWalletUtils extends MagicWalletUtils { 
  
  public web3Provider: StargateClient | null = null;
  public isMagicWallet = true;
  constructor(network: NETWORK) {
    super();
    this.network = network;
  }

  async _initializeWeb3() {
    const magic = await getMagic({chainId: this.network});
    const RPC_NODE = RPC_NODE_OPTIONS.find((n) => n.chainId === this.network);
    if (!RPC_NODE) {
      throw new Error("RPC Node config fail. Incorect params, ");
    }
    const web3Provider = await StargateClient.connect(RPC_NODE?.rpcUrl);
    // this.web3Provider = web3Provider;
    // get account address and wallet type
    try {
      const info = await magic.user.getInfo() || undefined;
      this.walletAddress = info?.publicAddress|| undefined;
    } catch (error) {
      console.log('error', error);
    }
  }
  
  protected async _loadBalances() {
    throw new Error("Method not implemented.");
  }
}