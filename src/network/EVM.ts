import { ethers } from "ethers";
import { NETWORK } from "../constants/chains";
import { getTokensBalances } from "../servcies/ankr.service";
import { IAsset } from "../interfaces/asset.interface";
import { MagicWallet } from "./MagicWallet";

const fetchUserAssets = async (walletAddress: string) => {
  console.log(`[INFO] fetchUserAssets()`, walletAddress);
  if (!walletAddress) return null;
  const assets = await getTokensBalances([], walletAddress);
  return assets;
};

/**
 * The EVM (Ethereum Virtual Machine) class extends the abstract MagicWallet class
 */
export class EVM extends MagicWallet {
  // Web3 instance to interact with the Ethereum blockchain
  public web3Provider: ethers.providers.Web3Provider | null = null;
  public walletAddress: string | undefined = undefined;
  // The network for this class instance
  public network: NETWORK;

  public assets: IAsset[] = [];

  constructor(network: NETWORK) {
    super();
    // Setting the network type
    this.network = network;
    // Calling the initialize method from MagicWallet
    this.initialize();
  }

  protected async _fetchUserAssets(): Promise<IAsset[]> {
    const { publicAddress } = (await this.getInfo()) || {};
    if (!publicAddress) return [];
    const assets = await fetchUserAssets(publicAddress);
    if (!assets) return [];
    return assets;
  }

  // Asynchronous method to initialize the Web3 instance
  async initializeWeb3(): Promise<void> {
    const defaultProvider = new ethers.providers.JsonRpcProvider(
      this._defaultRCP.rpcUrl
    );
    const provider = await this._getMagicProvider(); // Get the provider from the magic
    this.web3Provider = new ethers.providers.Web3Provider(
      provider || defaultProvider,
      "any"
    ); // Initializing the Web3 instance
    // check if user is logged in

    const infos = await this.getInfo();
    if (infos?.publicAddress) {
      this.walletAddress = infos.publicAddress;
      this.assets = await this._fetchUserAssets();
    }
  }

  async sendTx(ops: { txData: string }) {
    const signer = this.web3Provider?.getSigner();
    const txResponse = await signer?.sendTransaction({
      value: ops.txData || undefined,
    });
    const txReceipt = await txResponse?.wait();
    return txReceipt;
  }

  // Method to get user information using Magic SDK + web3Provider
  public async getInfo() {
    const data = await super.getInfo();
    if (!data) {
      return undefined;
    }
    // update provider
    const defaultProvider = new ethers.providers.JsonRpcProvider(
      this._defaultRCP.rpcUrl
    );
    const provider = await this._getMagicProvider(); // Get the provider from the magic
    this.web3Provider = new ethers.providers.Web3Provider(
      provider || defaultProvider,
      "any"
    );
    // get account address and wallet type
    const info = {
      ...data,
      publicAddress: (await this.web3Provider.getSigner().getAddress()) || undefined,
    };
    console.log("[INFO] getInfo: ", info);
    return info;
  }
}
