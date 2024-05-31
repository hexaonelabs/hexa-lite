import { CHAIN_DEFAULT } from "@/constants/chains";
import { setErrorState, setWeb3State } from "../actions";
import { IWeb3State } from "..";
import web3Connector from '@/servcies/firebase-web3-connect';
// import { MagicWalletUtils } from "@/network/MagicWallet";

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

//   console.log(`[INFO] {{Web3Effect}} initializeWeb3() - `, chainId);
//   const magicUtils = await MagicWalletUtils.create(chainId);
//   console.log(`[INFO] {{Web3Effect}} initialized - `, magicUtils);
//   const web3Provider = magicUtils.web3Provider;
//   const walletAddress = magicUtils.walletAddress;
//   const currentNetwork = magicUtils.network;
//   const isMagicWallet = magicUtils.isMagicWallet;

//   if (magicUtils?.walletAddress) {
//     console.log('[INFO] {{Web3Effect}} load balance...');
//     await magicUtils.loadBalances().catch((err) => {
//       setErrorState(new Error(`Load wallet balances failed. Try again later.`));
//       console.error('[ERROR] {{Web3Effect}} load balance error: ', err?.message ? err.message : err);
//     });
//     console.log('[INFO] {{Web3Effect}} load Txs...');
//     await magicUtils.loadTransactionHistory().catch((err) => {
//       setErrorState(new Error(`Load wallet transactions failed. Try again later.`));
//       console.error('[ERROR] {{Web3Effect}} load txs error: ', err?.message ? err.message : err);
//     });    
//   }

//   const state = {
//     web3Provider,
//     walletAddress,
//     currentNetwork,
//     isMagicWallet,
//     assets: magicUtils.assets,
//     txs: magicUtils.txs,
//     disconnectWallet: async () => {
//       await magicUtils.disconnect();
//       await initializeWeb3(chainId);
//     },
//     connectWallet: async (ops?: {email: string;}) => {
//       await magicUtils.connect(ops);
//       await initializeWeb3(chainId);
//     },
//     switchNetwork: async (chainId: number) => {
//       await initializeWeb3(chainId);
//     },
//     loadAssets: async (force?: boolean) => {
//       await magicUtils.loadBalances(force).catch((err) => {
//         console.error('[ERROR] {{Web3Effect}} load balance error: ', err?.message ? err.message : err);
//       });
//       setWeb3State({
//         ...state,
//         assets: magicUtils.assets,
//       });
//     },
//     loadTxs: async (force?: boolean) => {
//       await magicUtils.loadTransactionHistory().catch((err) => {
//         console.error('[ERROR] {{Web3Effect}} load txs error: ', err?.message ? err.message : err);
//       });
//       setWeb3State({
//         ...state,
//         txs: magicUtils.txs,
//       });
//     },
//     transfer: async (ops: {
//       inputFromAmount: number;
//       inputToAddress: string;
//       inputFromAsset: string;
//     }) => {
//       const result = await magicUtils.sendToken(
//         ops.inputToAddress, 
//         ops.inputFromAmount, 
//         ops.inputFromAsset
//       );
//       console.log('[INFO] {{Web3Effect}} transfer result: ', result);
//     }
//   };
//   console.log('[INFO] {{Web3Effect}} state: ', state);
//   setWeb3State(state);
// };