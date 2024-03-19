import { ethers } from "ethers";
import { NETWORK } from "../constants/chains";
import { getTokensBalances } from "../servcies/ankr.service";
import { MagicWalletUtils } from "./MagicWallet";
import { getMagic } from "@/servcies/magic";

const fetchUserAssets = async (walletAddress: string, force?: boolean) => {
  console.log(`[INFO] fetchUserAssets()`, walletAddress);
  if (!walletAddress) return null;
  const assets = await getTokensBalances([], walletAddress, force);
  return assets;
};

export class EVMWalletUtils extends MagicWalletUtils {
  public web3Provider: ethers.providers.Web3Provider | null = null;
  public isMagicWallet: boolean = true;

  constructor(network: NETWORK) {
    super();
    this.network = network;
  }

  async _initializeWeb3() {
    const magic = await getMagic({ chainId: this.network });
    const provider = await magic.wallet.getProvider();
    const web3Provider = new ethers.providers.Web3Provider(provider, "any");
    this.web3Provider = web3Provider;
    // detect if is metamask and set correct network
    if (
      web3Provider?.connection?.url === "metamask" ||
      web3Provider.provider.isMetaMask
    ) {
      this.isMagicWallet = false;
      await this._setMetamaskNetwork();
    } else {
      this.isMagicWallet = true;
    }
    // get account address and wallet type
    try {
      const signer = web3Provider?.getSigner();
      this.walletAddress = (await signer?.getAddress()) || undefined;
    } catch (error) {
      console.error(
        "[ERROR] User is not connected. Unable to get wallet address.",
        error
      );
      // return;
    }
  }

  async loadBalances(force?: boolean) {
    if (!this.walletAddress) return;
    const assets = await fetchUserAssets(this.walletAddress, force);
    if (!assets) return;
    this.assets = assets;
  }

  async sendToken(destination: string, decimalAmount: number, contactAddress: string) {
    if(!this.web3Provider) {
      throw new Error("Web3Provider is not initialized");
    }
    try {
      const signer = this.web3Provider.getSigner();
      const amount = ethers.utils.parseEther(decimalAmount.toString()); // Convert 1 ether to wei
      const contract = new ethers.Contract(contactAddress, ["function transfer(address, uint256)"], signer);
      const tx = await contract.transfer(destination, amount);
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      return receipt;
    } catch (err: any) {
      console.error(err);
      throw new Error("Error during sending token");
    }
  }

  private async _setMetamaskNetwork() {
    if (!this.web3Provider) {
      throw new Error("Web3Provider is not initialized");
    }
    // check current network is same as selected network
    const network = await this.web3Provider.getNetwork();
    if (network.chainId === this.network) {
      return;
    }
    // switch network with ether
    try {
      await this.web3Provider.send("wallet_switchEthereumChain", [
        { chainId: ethers.utils.hexValue(this.network) },
      ]);
    } catch (error) {
      throw new Error(
        `Error during network setting. Please switch to ${this.network} network and try again.`
      );
    }
  }
}
