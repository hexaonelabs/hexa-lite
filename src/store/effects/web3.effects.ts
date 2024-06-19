import { CHAIN_DEFAULT } from "@/constants/chains";
import { patchWeb3State, setErrorState } from "../actions";
import { IWeb3State } from "..";
import web3Connector from '@/servcies/firebase-web3-connect';

const initialWeb3State: IWeb3State = {
  currentNetwork: CHAIN_DEFAULT.id,
  walletAddress: null,
  signer: null,
  connectWallet: async (ops?: {email: string;}) => {
    try {
      await web3Connector.connect();
    } catch (error: any) {
      console.error("[ERROR] handleConnect:", error);
      // disable error feedback UI 
      // because the error message is managed by the web3Connector
    }
    await initState(CHAIN_DEFAULT.id);
  },
  disconnectWallet: async () => {},
  loadAssets: async () => {},
  loadTxs: async () => {},
  switchNetwork: async () => {},
  transfer: async () => {},
  assets: [],
  nfts: [],
  txs: [],
};

const initState = async (chainId: number = CHAIN_DEFAULT.id) => {
  const wallet = web3Connector.currentWallet();
  console.log(`[INFO] {{Web3Effect}} initializeWeb3() - `, {chainId, wallet});
  const signer = await web3Connector?.getSigner() || null;

  const state: Omit<IWeb3State, 'assets'|'nfts'|'txs'> = {
    currentNetwork: chainId,
    walletAddress: wallet?.address || null,
    signer,
    connectWallet: async (ops?: {email: string;}) => {
      try {
        await web3Connector.connect();
      } catch (error: any) {
        console.error("[ERROR] handleConnect:", error);
        // disable error feedback UI 
        // because the error message is managed by the web3Connector
      }
      await initState(chainId);
    },
    disconnectWallet: async () => {
      await web3Connector.disconnect();
      window.location.reload();
    },
    loadAssets: async(force) => {
      if (!wallet) {
        patchWeb3State({
          assets: []
        });
        return;
      }
      const assets = await web3Connector.loadBalances(force);
      patchWeb3State({
        assets
      });
    },
    loadTxs: async (force) => {
      if (!wallet) {
        patchWeb3State({
          txs: []
        });
        return;
      }
      const txs = await web3Connector.loadTxs(force);
      patchWeb3State({
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
  // update state with available props, methods and Signer
  patchWeb3State(state);

  // load async data without `await` to avoid blocking the UI
  state.loadAssets(false);
  state.loadTxs(false);
  web3Connector
    .loadNFTs(false)
    .then(nfts => {
      wallet 
      ? patchWeb3State({nfts})
      : patchWeb3State({nfts: []});
    });
}

export const initializeWeb3 = async (chainId: number = CHAIN_DEFAULT.id) => {
  // do not initialize state if user is runing authentication proccess
  // from `auth/**` routes to prevent wallet creation on page 
  // that the user is requested to close after authentication success
  if (window.location.pathname.includes('/auth/')) {
    return;
  }
  web3Connector.onConnectStateChanged(async (user) => {
    // Perform state initialization
    console.log('[INFO] {{Web3Effect}} onConnectStateChanged: ', user);
    if (user) {
      await initState(chainId);
    } else {
      patchWeb3State(initialWeb3State);
    }
  });
};
