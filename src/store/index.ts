import { NETWORK } from '@/constants/chains';
import { IAsset } from '@/interfaces/asset.interface';
import { IPoolGroup, IUserSummary } from '@/interfaces/reserve.interface';
import { Web3ProviderType } from '@/interfaces/web3.interface';
import { MarketPool } from '@/pool/Market.pool';
import { Store as PullStateStore } from 'pullstate';

export interface IWeb3State {
  currentNetwork: NETWORK;
  walletAddress: string | undefined;
  web3Provider: Web3ProviderType | null;
  isMagicWallet: boolean;
  assets: IAsset[];
  connectWallet(ops?: {email: string;}): Promise<void>;
  disconnectWallet(): Promise<void>;
  switchNetwork: (chainId: number) => Promise<void>;
  loadAssets: () => Promise<void>;
}

export interface IPoolsState {
  marketPools: MarketPool[];
  userSummaryAndIncentivesGroup: IUserSummary[] | null;
  totalTVL: number | null;
  refresh: (type?: "init" | "userSummary") => Promise<void>;
};

export interface IStore  {
  pools: IPoolsState,
  web3:IWeb3State
}

const defaultState: IStore = Object.freeze({
  pools: {
    marketPools:[],
    userSummaryAndIncentivesGroup: null,
    totalTVL: null,
    refresh: async (type = "init") => {
      throw new Error("refresh function not implemented");
    },
  },
  web3: {
    currentNetwork: NETWORK.optimism,
    walletAddress: undefined,
    web3Provider: null,
    isMagicWallet: false,
    assets: [],
    connectWallet: async (ops?: {email: string;}) => {
      throw new Error("connectWallet function not implemented");
    },
    disconnectWallet: async () => {
      throw new Error("disconnectWallet function not implemented");
    },
    switchNetwork: async (chainId: number) => {
      throw new Error("switchNetwork function not implemented");
    },
    loadAssets: async () => {
      throw new Error("loadAssets function not implemented");
    },
  }
});

const Store = new PullStateStore<IStore>(defaultState);

export default Store;
