import { BitcoinExtension } from "@magic-ext/bitcoin";
import { MagicWalletUtils } from "./MagicWallet";
import { NETWORK } from "@/constants/chains";
import { RPC_NODE_OPTIONS, getMagic } from "@/servcies/magic";


export class BitcoinWalletUtils extends MagicWalletUtils { 
  
  public web3Provider: null = null;
  public isMagicWallet = true;

  constructor(network: NETWORK) {
    super();
    this.network = network;
  }

  async _initializeWeb3() {
    console.log(`[INFO] Bitcoin: initializeWeb3...`);
    const magic = await getMagic({chainId: this.network});
    const RPC_NODE = RPC_NODE_OPTIONS.find((n) => n.chainId === this.network);
    if (!RPC_NODE) {
      throw new Error("RPC Node config fail. Incorect params, ");
    }
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