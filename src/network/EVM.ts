import { ethers } from "ethers";
import { NETWORK } from "../constants/chains";
import { MagicWalletUtils } from "./MagicWallet";
import { getMagic } from "@/servcies/magic";
import { fetchBalance, isEVMWindowProviderAvailable } from "@/servcies/evm.service";

export class EVMWalletUtils extends MagicWalletUtils {
  public web3Provider: ethers.providers.Web3Provider | null = null;
  public isMagicWallet: boolean = true;

  constructor(network: NETWORK) {
    super();
    this.network = network;
  }

  async _initializeWeb3() {
    if (this._withExternalWallet) {
      if (!isEVMWindowProviderAvailable()) {
        throw new Error(
          "EVM window provider is not available. Install Rabby Wallet or Metamask and try again."
        );
      }
      const provider = (window as any).ethereum;
      this.isMagicWallet = false;
      const web3Provider = new ethers.providers.Web3Provider(provider);
      this.web3Provider = web3Provider;
      // get current account
      const signer = web3Provider?.getSigner();
      this.walletAddress = (await signer?.getAddress()) || undefined;
    } else {
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
      }
    }
  }

  async loadBalances() {
    if (!this.walletAddress) return;
    const assets = await fetchBalance(this.walletAddress);
    if (!assets) return;
    this.assets = assets;
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
