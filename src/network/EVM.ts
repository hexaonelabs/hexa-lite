
import { ethers } from "ethers";
import { NETWORK } from "../constants/chains";
import { getTokensBalances } from "../servcies/ankr.service";
import { IAsset } from "../interfaces/asset.interface";
import { MagicWalletUtils } from "./MagicWallet";
import { getMagic } from "@/servcies/magic";

const fetchUserAssets = async (walletAddress: string) => {
  console.log(`[INFO] fetchUserAssets()`, walletAddress);
  if (!walletAddress) return null;
  const assets = await getTokensBalances([], walletAddress);
  return assets;
};


export class EVMWalletUtils extends MagicWalletUtils { 
  
  public web3Provider: ethers.providers.Web3Provider | null = null;
  constructor(network: NETWORK) {
    super();
    this.network = network;
  }

  async _initializeWeb3() {
    const magic = await getMagic({chainId: this.network});
    const provider = await magic.wallet.getProvider();
    const web3Provider = new ethers.providers.Web3Provider(
      provider,
      "any"
    );
    this.web3Provider = web3Provider;
    // get account address and wallet type
    try {
      const signer = web3Provider?.getSigner();
      this.walletAddress = await signer?.getAddress() || undefined;
    } catch (error) {
      // console.log('error', error);
    }
    if (this.walletAddress) {
      await this._loadBalances();
    };
  }

  async _loadBalances() {
    const assets = await fetchUserAssets(this.walletAddress || "");
    if (!assets) return;
    this.assets = assets;
  }
  
}