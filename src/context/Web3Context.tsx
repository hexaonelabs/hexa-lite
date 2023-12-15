'use client'

import React, { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import { CHAIN_DEFAULT, NETWORK } from "../constants/chains";
import { StargateClient } from "@cosmjs/stargate";
import { IAsset } from "../interfaces/asset.interface";
import { connect, disconnect, getMagic } from "@/servcies/magic";
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
      const magicUtils = await MagicWalletUtils.create();
      await magicUtils.connect(ops);
      const address = magicUtils.walletAddress;
      const web3Provider = magicUtils.web3Provider;
      const currentNetwork = magicUtils.network;
      const assets = magicUtils.assets;
      // const address = await connect();
      // const magic = await getMagic()
      // console.log(`[INFO] {{Web3Context}} connectWallet() - `, address);
      // const info = await magic.user.getInfo();
      // const isLoggedIn = await magic.user.isLoggedIn();
      // const provider = await magic.wallet.getProvider();
      // const web3Provider = new ethers.providers.Web3Provider(
      //   provider,
      //   "any"
      // );
      // const signer = web3Provider.getSigner();
      setWeb3State((prev) => ({
        ...prev,
        currentNetwork,
        walletAddress: address || undefined,
        web3Provider,
        assets
      }));
    },
    disconnectWallet: async () => {
      await disconnect();
      setWeb3State((prev) => ({
        ...prev,
        currentNetwork: CHAIN_DEFAULT.id,
        walletAddress: undefined,
        web3Provider: null,
      }));
    },
    switchNetwork: async (chainId: number) => {
      console.log('[INFO] {{Web3Context}} switchNetwork() - ', chainId)
      const magicUtils = await MagicWalletUtils.create(chainId);
      setWeb3State((prev) => ({
        ...prev,
        currentNetwork: magicUtils.network,
        walletAddress: magicUtils.walletAddress,
        web3Provider: magicUtils.web3Provider,
      }));
    },
    web3Provider: null
  });

  const initializeWeb3 = async () => {
    console.log(`[INFO] {{Web3Context}} initializeWeb3() - `, CHAIN_DEFAULT.id);
    
    const magicUtils = await MagicWalletUtils.create(CHAIN_DEFAULT.id);
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
      isMagicWallet
    }));
  };

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
