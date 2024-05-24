import { FirebaseWeb3Connect } from '@hexaonelabs/firebase-web3connect';
import { auth } from '@/firebase-config';
import { CHAIN_AVAILABLES } from '@/constants/chains';
import { TxInterface } from '@/interfaces/tx.interface';
import { getTransactionsHistory } from './zerion.service';
import { IAsset } from '@/interfaces/asset.interface';
import { fetchUserAssets } from '@/network/EVM';

class Web3Connector {

  private readonly _connector = new FirebaseWeb3Connect(auth, 'APIKEY');

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

  getSigner() {
    return this._connector?.provider?.getSigner(this._connector.wallet?.address);
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
          const evmAssets = await fetchUserAssets(wallet.address, force)||[];
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
export default web3Connector;
