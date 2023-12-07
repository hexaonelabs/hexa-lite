

import { Connection, Transaction} from '@solana/web3.js';
import { MagicWalletUtils } from "./MagicWallet";
import { RPC_NODE_OPTIONS, getMagic } from "../servcies/magic";
import { IAsset } from "../interfaces/asset.interface";
import { NETWORK } from '@/constants/chains';

/**
 * Solana Wallet Utils
 * Support for Solana Wallet
 */
export class SolanaWalletUtils extends MagicWalletUtils { 
  
  public web3Provider: Connection | null = null;
  public isMagicWallet: boolean = true;
  constructor(network: NETWORK) {
    super();
    this.network = network;
  }

  async _initializeWeb3() {
    console.log(`[INFO] Solana: initializeWeb3...`);
    const magic = await getMagic({chainId: this.network});
    const RPC_NODE = RPC_NODE_OPTIONS.find((n) => n.chainId === this.network);
    if (!RPC_NODE) {
      throw new Error("RPC Node config fail. Incorect params, ");
    }
    const web3Provider = new Connection(RPC_NODE?.rpcUrl);
    // this.web3Provider = web3Provider;
    // get account address and wallet type
    try {
      const info = await magic.user.getInfo() || undefined;
      console.log('[INFO] Solana: user info', info);
      
      this.walletAddress = info?.publicAddress|| undefined;
    } catch (error) {
      console.log('error', error);
    }
  }
  
  protected async _loadBalances() {
    throw new Error("Method not implemented.");
  } 
}