import { CHAIN_DEFAULT } from "@/constants/chains";
import { MagicWalletUtils } from "@/network/MagicWallet";
import { setWeb3State } from "../actions";

export const initializeWeb3 = async (chainId: number = CHAIN_DEFAULT.id, withExternalWallet: boolean = false) => {
  console.log(`[INFO] {{Web3Effect}} initializeWeb3() - `, chainId);
  const magicUtils = await MagicWalletUtils.create(chainId, withExternalWallet);
  console.log(`[INFO] {{Web3Effect}} initialized - `, magicUtils);
  const web3Provider = magicUtils.web3Provider;
  const walletAddress = magicUtils.walletAddress;
  const currentNetwork = magicUtils.network;
  const isMagicWallet = magicUtils.isMagicWallet;

  if (magicUtils?.walletAddress) {
    console.log('[INFO] {{Web3Effect}} load balance...');
    await magicUtils.loadBalances().catch((err) => {
      console.error('[ERROR] {{Web3Effect}} load balance error: ', err?.message ? err.message : err);
    });
  }

  const state = {
    web3Provider,
    walletAddress,
    currentNetwork,
    isMagicWallet,
    assets: magicUtils.assets,
    disconnectWallet: async () => {
      await magicUtils.disconnect();
      await initializeWeb3(chainId);
    },
    connectWallet: async (ops?: {email?: string; oAuth?: "google";}) => {
      await magicUtils.connect(ops);
      await initializeWeb3(chainId);
    },
    switchNetwork: async (chainId: number) => {
      await initializeWeb3(chainId);
    },
    loadAssets: async () => {
      await magicUtils.loadBalances().catch((err) => {
        console.error('[ERROR] {{Web3Effect}} load balance error: ', err?.message ? err.message : err);
      });
      setWeb3State({
        ...state,
        assets: magicUtils.assets,
      });
    },
  };
  console.log('[INFO] {{Web3Effect}} state: ', state);
  setWeb3State(state);
};