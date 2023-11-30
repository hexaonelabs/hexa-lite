import React, { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import { CHAIN_DEFAULT, NETWORK } from "../constants/chains";
import { MagicWallet } from "../network/MagicWallet";
import { StargateClient } from "@cosmjs/stargate";
import { IAsset } from "../interfaces/asset.interface";

export type Web3ProviderType = ethers.providers.Web3Provider | StargateClient; // | Avalanche;

// Define the structure of the Web3 context state
type Web3ContextType = {
  currentNetwork: NETWORK;
  walletAddress: string | undefined;
  web3Provider: Web3ProviderType | null;
  getInfo: () => Promise<
    | {
        publicAddress: string | undefined;
        walletType: string;
      }
    | undefined
  >;
  connectWallet(): Promise<void>;
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
  connectWallet: () => Promise.resolve(null as any),
  disconnectWallet: () => Promise.resolve(null as any),
  switchNetwork: () => Promise.resolve(null as any),
  getInfo: () => Promise.resolve(null as any),
});

// Custom hook to use the Web3 context
export const useWeb3Provider = () => useContext(Web3Context);

// Provider component to wrap around components that need access to the context
export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  // Local state for magic network instance
  const [wallet, setWallet] = useState<MagicWallet>(null as any);
  const [network, setNetwork] = useState<NETWORK>(CHAIN_DEFAULT.id);
  const [state, setState] = useState<Web3ContextType>({
    currentNetwork: CHAIN_DEFAULT.id,
    walletAddress: undefined,
    web3Provider: null,
    assets: [],
    connectWallet: () => Promise.resolve(null as any),
    disconnectWallet: () => Promise.resolve(null as any),
    switchNetwork: () => Promise.resolve(null as any),
    getInfo: () => Promise.resolve(null as any),
  });

  // Initialize Web3 instance
  const initializeWeb3 = async () => {
    console.log(`[INFO] {{Web3Context}} initializeWeb3() - `, network);
    const magicWallet = MagicWallet.create(network);
    // call method to initialize web3 instance
    await magicWallet.initializeWeb3();
    if (!magicWallet.web3Provider) {
      throw new Error("Web3 instance not initialized");
    }
    // Save the instance to state
    setWallet(() => magicWallet);
    setState((prev) => ({
      ...prev,
      currentNetwork: magicWallet.network,
      walletAddress: magicWallet.walletAddress,
      web3Provider: magicWallet.web3Provider,
      assets: magicWallet.assets,
      connectWallet: () =>
        magicWallet.connect().then(() =>
          setState((prev) => ({
            ...prev,
            walletAddress: magicWallet.walletAddress,
            web3Provider: magicWallet.web3Provider,
            assets: magicWallet.assets,
          }))
        ),
      disconnectWallet: () =>
        magicWallet.logout().then(async () => {
          await initializeWeb3();
        }),
      switchNetwork: async (chainId: number) => setNetwork(() => chainId),
      getInfo: () => magicWallet.getInfo(),
    }));
    return magicWallet.web3Provider;
  };

  // Effect to initialize Web3 when the component mounts
  useEffect(() => {
    initializeWeb3();
  }, [network]);

  console.log(`[INFO] {{Web3Context}} render() - wallet:`, wallet);

  if (!wallet) {
    return null;
  }

  return (
    <Web3Context.Provider
      value={state}
      // value={{
      //   walletAddress: wallet.walletAddress,
      //   currentNetwork: wallet.network,
      //   web3Provider: wallet.web3Provider,
      //   assets: wallet.assets,
      //   getInfo: () => wallet.getInfo(),
      //   connectWallet: () => wallet.connect().then(() => setWallet(() => wallet)),
      //   disconnectWallet: () => wallet.logout(),
      //   switchNetwork: async (chainId: number) =>  setNetwork(() => chainId)
      // }}
    >
      {children}
    </Web3Context.Provider>
  );
};
