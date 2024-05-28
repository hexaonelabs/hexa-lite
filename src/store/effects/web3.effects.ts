import { CHAIN_DEFAULT } from "@/constants/chains";
import { setErrorState, setWeb3State } from "../actions";
import { IWeb3State } from "..";
import web3Connector from '@/servcies/firebase-web3-connect';

const initState = async (chainId: number = CHAIN_DEFAULT.id) => {
  const wallet = web3Connector.currentWallet();
  console.log(`[INFO] {{Web3Effect}} initializeWeb3() - `, {chainId, wallet});
  const assets = await web3Connector.loadBalances(false);
  const txs = await web3Connector.loadTxs(false);
  const signer = await web3Connector?.getSigner();

  const state: IWeb3State = {
    assets,
    currentNetwork: chainId,
    walletAddress: wallet?.address,
    signer,
    txs,
    connectWallet: async (ops?: {email: string;}) => {
      await web3Connector.connect();
      await initState(chainId);
    },
    disconnectWallet: async () => {
      await web3Connector.disconnect();
      await initState(CHAIN_DEFAULT.id);
    },
    loadAssets: async(force) => {
      if (!wallet) {
        setWeb3State({
          ...state,
          assets: []
        });
        return;
      }
      const assets = await web3Connector.loadBalances(force);
      setWeb3State({
        ...state,
        assets
      });
    },
    loadTxs: async (force) => {
      if (!wallet) {
        setWeb3State({
          ...state,
          txs: []
        });
        return;
      }
      const txs = await web3Connector.loadTxs(force);
      setWeb3State({
        ...state,
        txs
      });
    },
    switchNetwork: async (chainId: number) => {
      await web3Connector.switchNetwork(chainId);
      await initState(chainId);
    },
    transfer: async (ops) => {
      if (!wallet) {
        throw new Error("Wallet is not connected");
      }
      await wallet.sendTransaction(ops);
    },
  }
  console.log('[INFO] {{Web3Effect}} state: ', state);
  setWeb3State(state);
}

export const initializeWeb3 = async (chainId: number = CHAIN_DEFAULT.id) => {
  web3Connector.onConnectStateChanged(async (user) => {
    console.log('[INFO] {{Web3Effect}} onConnectStateChanged: ', user);
    await initState(chainId)
  });
};