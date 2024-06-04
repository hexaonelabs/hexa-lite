import { FirebaseWeb3Connect } from '@hexaonelabs/firebase-web3connect';
import { auth } from '@/firebase-config';
import { CHAIN_AVAILABLES, CHAIN_DEFAULT } from '@/constants/chains';
import { TxInterface } from '@/interfaces/tx.interface';
import { getTransactionsHistory } from './zerion.service';
import { IAsset } from '@/interfaces/asset.interface';
import { getTokensBalances } from './ankr.service';
import { getTokensPrice } from './lifi.service';
import { Signer, utils } from 'ethers';

/**
 * Function tha takes wallet address and fetches all assets for that wallet
 * using Ankr API. It also fetches token price from LiFi API if Ankr response contains
 * token with balance > 0 && balanceUsd === 0 && priceUsd === 0
 * This ensures that all tokens have price in USD and the total balance is calculated correctly
 * for each token that user has in the wallet.
 */
const fetchEVMAssets = async (walletAddress: string, force?: boolean) => {
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

/**
 * Web3Connector class that wraps FirebaseWeb3Connect class
 * that provides methods to connect, disconnect, switch accross networks and
 * get signer for the connected wallet.
 * It also provides methods to load balances and transactions for the connected wallet
 * and also provides methods to listen to connect state changes.
 */
class Web3Connector {

  private readonly _connector = new FirebaseWeb3Connect(auth, 'APIKEY', {
    chainId: CHAIN_DEFAULT.id,
  });

  async connect(){
    const { address } = await this._connector.connectWithUI() || {};
    if (!address) {
      throw new Error('Connect wallet fail');
    }
    return address;
  }

  async disconnect(){
    this._connector.signout();
    return true;
  }
  wallets(){
    return [this._connector.wallet];
  }
  async switchNetwork(chainId: number){
    await this._connector.switchNetwork(chainId);
  }
  currentWallet(){
    return this._connector.wallet;
  }

  async getSigner(): Promise<Signer|undefined> {
    try {
      const signer = await this._connector.wallet?.getSigner<Signer>();
      return signer;
    } catch (error) {
      return undefined;
    }
  }

  async getNetworkFeesAsUSD(): Promise<string> {
    // get ethers network fees using ethers.js
    const signer = await this.getSigner();
    if (!signer) {
      throw new Error('Signer not available');
    }
    const network = await signer.provider?.getNetwork();
    if (!network) {
      throw new Error('Network not available');
    }
    // get network fees in USD
    const networkFees = await signer.provider?.getFeeData();
    if (!networkFees || !networkFees.gasPrice || !networkFees.maxFeePerGas) {
      throw new Error('Network fees not available');
    }
    // get network fees in ETH
    const totalFee = utils.formatUnits(
      networkFees.gasPrice.add(networkFees.maxFeePerGas), 'gwei'
    );
    // const response = await fetch('https://api.coingecko.com/api/v3/coins/ethereum');
    // const result = await response.json();
    // const ethPriceUSD = result?.market_data?.current_price?.usd as number||0;
    // const total = ethPriceUSD * Number(totalFee);
    return Number(totalFee).toFixed(0) + ' Gwei';
  }

  onConnectStateChanged(callback: (user: {
    address: string;
  } | null) => void){
    this._connector.onConnectStateChanged(callback);
  }

  async loadBalances(force?: boolean){
    const assets: IAsset[] = [];
    for (const wallet of this.wallets()) {
      if (!wallet) {
        return assets;
      }
      const chain = CHAIN_AVAILABLES.find((chain) => chain.id === wallet.chainId);
      switch (true) {
        // evm wallet type 
        case chain?.type === 'evm': {
          const evmAssets = await fetchEVMAssets(wallet.address, force)||[];
          assets.push(...evmAssets);
          break;
        }
        default:
          break
      }
    }
    return assets;
  };
  
  async loadTxs(force?: boolean) {
    const txs: TxInterface[] = [];
    for (const wallet of this.wallets()) {
      if (!wallet) {
        return txs;
      }
      const chain = CHAIN_AVAILABLES.find((chain) => chain.id === wallet.chainId);
      switch (true) {
        // evm wallet type 
        case chain?.type === 'evm': {
          const txs = await getTransactionsHistory(wallet.address);
          txs.push(...txs);
          break;
        }
        default:
          break
      }
    }
    return txs;
  }

}
const web3Connector = new Web3Connector();

// export default instance
export default web3Connector;
