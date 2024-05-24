import { ethers } from "ethers";
import { NETWORK } from "../constants/chains";
import { getTokensBalances } from "../servcies/ankr.service";
import { MagicWalletUtils } from "./MagicWallet";
import { getMagic } from "@/servcies/magic";
import { getTokensPrice } from "@/servcies/lifi.service";
import { getTransactionsHistory } from "@/servcies/zerion.service";

/**
 * Function tha takes wallet address and fetches all assets for that wallet
 * using Ankr API. It also fetches token price from LiFi API if Ankr response contains
 * token with balance > 0 && balanceUsd === 0 && priceUsd === 0
 * This ensures that all tokens have price in USD and the total balance is calculated correctly
 * for each token that user has in the wallet.
 */
export const fetchUserAssets = async (walletAddress: string, force?: boolean) => {
  console.log(`[INFO] fetchUserAssets()`, walletAddress);
  if (!walletAddress) return null;
  const assets = await getTokensBalances([], walletAddress, force);
  // remove elements with 0 balance and add to new arrany using extracting
  const assetWithBalanceUsd = [], 
        assetsWithoutBalanceUsd = [];
  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i];
    (asset.balanceUsd === 0 && asset.balance > 0)
      ?  assetsWithoutBalanceUsd.push(asset)
      : assetWithBalanceUsd.push(asset);
  }
  // get token price for tokens without balanceUsd
  const tokenWithbalanceUsd = await getTokensPrice(assetsWithoutBalanceUsd);
  return [
    ...assetWithBalanceUsd, 
    ...tokenWithbalanceUsd
  ];
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
      console.log('[INFO] sendToken: ',{
        destination, decimalAmount, contactAddress
      })
      const signer = this.web3Provider.getSigner();
      // Check if the receiver address is the same as the token contract address
      if (destination.toLowerCase() === contactAddress.toLowerCase()) {
        // Sending tokens to the token contract address
        throw new Error('Sending tokens to ERC20 contract address is not allowed.');
      }
      const amount = ethers.utils.parseUnits(decimalAmount.toString()); // Convert 1 ether to wei
      
      let tx;
      // Check if the token address is the same as the native ETH address
      if (contactAddress.toLowerCase() === ethers.constants.AddressZero.toLowerCase()) {
        console.log('[INFO] Sending native token');
        tx = await signer.sendTransaction({
          to: destination,
          value: amount
        });
      } else {
        console.log('[INFO] Sending erc20 token');
        // ABI (Application Binary Interface) of the ERC20 token contract
        const tokenABI = [
          // Standard ERC20 functions
          'function balanceOf(address) view returns (uint)',
          'function transfer(address to, uint amount) returns (boolean)'
        ];
        // Load the ERC20 token contract
        const tokenContract = new ethers.Contract(contactAddress, tokenABI, signer);
        // Convert amount to wei if necessary
        // (depends on the token's decimal precision)
        // Call the transfer function of the ERC20 token contract
        tx = await tokenContract.transfer(destination, amount);
      }
      console.log('[INFO] Transaction Hash:', tx.hash);
      const receipt = await tx.wait();
      console.log('[INFO] Transaction confirmed');

      return receipt;
    } catch (err: any) {
      console.error(err);
      throw new Error("Error during sending token");
    }
  }

  async loadTransactionHistory() {
    if (!this.walletAddress) {
      throw new Error("Wallet address is not initialized");
    }
    if (!this.web3Provider) {
      throw new Error("Web3Provider is not initialized");
    }
    // use ankr service to get transaction history from all networks
    const history = await getTransactionsHistory(this.walletAddress);
    this._txs = history;
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

  async estimateGas() {
    // const limit = await provider.estimateGas({
    //   from: signer.address,
    //   to: tokenContract,
    //   value: ethers.utils.parseUnits("0.000", "ether"),
    //   data: data
     
    // });
  }
}
