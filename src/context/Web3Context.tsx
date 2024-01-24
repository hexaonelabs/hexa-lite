'use client'

import React, { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import { CHAIN_DEFAULT, NETWORK } from "../constants/chains";
import { StargateClient } from "@cosmjs/stargate";
import { IAsset } from "../interfaces/asset.interface";
import { MagicWalletUtils } from "@/network/MagicWallet";

import { Connection as SolanaClient } from '@solana/web3.js';

export type Web3ProviderType = ethers.providers.Web3Provider | StargateClient | SolanaClient; // | Avalanche;

// Define the structure of the Web3 context state
type Web3ContextType = {
  currentNetwork: NETWORK;
  walletAddress: string | undefined;
  web3Provider: Web3ProviderType | null;
  isMagicWallet: boolean;
  connectWallet(ops?: {email: string;}): Promise<void>;
  disconnectWallet(): Promise<void>;
  switchNetwork: (chainId: number) => Promise<void>;
  assets: IAsset[];
};

// Create the context with default values
const Web3Context = createContext<Web3ContextType>({
  currentNetwork: CHAIN_DEFAULT.id,
  walletAddress: undefined,
  web3Provider: null,
  assets: [],
  isMagicWallet: false,
  connectWallet: (ops?: {email: string;}) => Promise.resolve(null as any),
  disconnectWallet: () => Promise.resolve(null as any),
  switchNetwork: () => Promise.resolve(null as any),
});

// Custom hook to use the Web3 context
export const useWeb3Provider = () => useContext(Web3Context);

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {

  const [web3State, setWeb3State] = useState<Web3ContextType>({
    assets: [],
    currentNetwork: CHAIN_DEFAULT.id,
    walletAddress: undefined,
    isMagicWallet: false,
    connectWallet: async (ops?: {email: string;}) => {
      throw new Error('connectWallet() not implemented');
    },
    disconnectWallet: async () => {
      throw new Error('disconnectWallet() not implemented');
    },
    switchNetwork: async (chainId: number) => {
      console.log('[INFO] {{Web3Context}} switchNetwork() - ', chainId)
      await initializeWeb3(chainId);
    },
    web3Provider: null
  });

  const initializeWeb3 = async (chainId: number = CHAIN_DEFAULT.id) => {
    console.log(`[INFO] {{Web3Context}} initializeWeb3() - `, chainId);
    const magicUtils = await MagicWalletUtils.create(chainId);
    console.log(`[INFO] {{Web3Context}} initialized - `, magicUtils);
    setStateValue(magicUtils);

    if (magicUtils?.walletAddress) {
      console.log('[INFO] {{Web3Context}} load balance - ', web3State?.assets);
      await magicUtils.loadBalances();
      setWeb3State((prev) => ({
        ...prev,
        assets: magicUtils.assets
      }));
    }
  };

  const setStateValue = (magicUtils: MagicWalletUtils) => {
    const web3Provider = magicUtils.web3Provider;
    const walletAddress = magicUtils.walletAddress;
    const currentNetwork = magicUtils.network;
    const assets = magicUtils.assets;
    const isMagicWallet = magicUtils.isMagicWallet;
    setWeb3State((prev) => ({
      ...prev,
      web3Provider,
      walletAddress,
      currentNetwork,
      assets,
      isMagicWallet,
      disconnectWallet: async () => {
        await magicUtils.disconnect();
        setStateValue(magicUtils);
      },
      connectWallet: async (ops?: {email: string;}) => {
        await magicUtils.connect(ops);
        setStateValue(magicUtils);
      }
    }));
  }

  useEffect(() => {
    initializeWeb3();
  }, []);

  return (
    <Web3Context.Provider
      value={web3State}
    >
      {children}
    </Web3Context.Provider>
  );
}
