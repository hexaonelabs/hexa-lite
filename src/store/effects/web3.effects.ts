import { CHAIN_DEFAULT } from "@/constants/chains";
import { MagicWalletUtils } from "@/network/MagicWallet";
import { setErrorState, setWeb3State } from "../actions";

export const initializeWeb3 = async (chainId: number = CHAIN_DEFAULT.id) => {
  console.log(`[INFO] {{Web3Effect}} initializeWeb3() - `, chainId);
  const magicUtils = await MagicWalletUtils.create(chainId);
  console.log(`[INFO] {{Web3Effect}} initialized - `, magicUtils);
  const web3Provider = magicUtils.web3Provider;
  const walletAddress = magicUtils.walletAddress;
  const currentNetwork = magicUtils.network;
  const isMagicWallet = magicUtils.isMagicWallet;

  if (magicUtils?.walletAddress) {
    console.log('[INFO] {{Web3Effect}} load balance...');
    await magicUtils.loadBalances().catch((err) => {
      setErrorState(new Error(`Load wallet balances failed. Try again later.`));
      console.error('[ERROR] {{Web3Effect}} load balance error: ', err?.message ? err.message : err);
    });
    console.log('[INFO] {{Web3Effect}} load Txs...');
    await magicUtils.loadTransactionHistory().catch((err) => {
      setErrorState(new Error(`Load wallet transactions failed. Try again later.`));
      console.error('[ERROR] {{Web3Effect}} load txs error: ', err?.message ? err.message : err);
    });    
  }

  const state = {
    web3Provider,
    walletAddress,
    currentNetwork,
    isMagicWallet,
    assets: magicUtils.assets,
    txs: magicUtils.txs,
    disconnectWallet: async () => {
      await magicUtils.disconnect();
      await initializeWeb3(chainId);
    },
    connectWallet: async (ops?: {email: string;}) => {
      await magicUtils.connect(ops);
      await initializeWeb3(chainId);
    },
    switchNetwork: async (chainId: number) => {
      await initializeWeb3(chainId);
    },
    loadAssets: async (force?: boolean) => {
      await magicUtils.loadBalances(force).catch((err) => {
        console.error('[ERROR] {{Web3Effect}} load balance error: ', err?.message ? err.message : err);
      });
      setWeb3State({
        ...state,
        assets: magicUtils.assets,
      });
    },
    loadTxs: async (force?: boolean) => {
      await magicUtils.loadTransactionHistory().catch((err) => {
        console.error('[ERROR] {{Web3Effect}} load txs error: ', err?.message ? err.message : err);
      });
      setWeb3State({
        ...state,
        txs: magicUtils.txs,
      });
    },
    transfer: async (ops: {
      inputFromAmount: number;
      inputToAddress: string;
      inputFromAsset: string;
    }) => {
      const result = await magicUtils.sendToken(
        ops.inputToAddress, 
        ops.inputFromAmount, 
        ops.inputFromAsset
      );
      console.log('[INFO] {{Web3Effect}} transfer result: ', result);
    }
  };
  console.log('[INFO] {{Web3Effect}} state: ', state);
  setWeb3State(state);
};