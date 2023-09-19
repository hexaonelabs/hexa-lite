import React, { createContext, useContext, useEffect, useState } from "react";
import { RPC_NODE_OPTIONS, getMagic, getRPCNodeOptions } from "../servcies/magic";
import { ethers } from "ethers";
import { CHAIN_AVAILABLES, CHAIN_DEFAULT } from "../constants/chains";

// Define the structure of the Web3 context state
type Web3ContextType = {
  ethereumProvider: ethers.providers.Web3Provider | null;
  initializeWeb3: () => Promise<ethers.providers.Web3Provider | undefined>;
  switchNetwork: (chainId: number) => Promise<ethers.providers.Web3Provider | undefined>;
};

const defaultProvider = new ethers.providers.JsonRpcProvider(
  RPC_NODE_OPTIONS.find((rpc) => rpc.chainId === CHAIN_DEFAULT.id)?.rpcUrl||''
);

// Create the context with default values
const Web3Context = createContext<Web3ContextType>({
  ethereumProvider: null,
  initializeWeb3: () => Promise.resolve(null as any),
  switchNetwork: () => Promise.resolve(undefined),
});

// Custom hook to use the Web3 context
export const useEthersProvider = () => useContext(Web3Context);

// Provider component to wrap around components that need access to the context
export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  // State variable to hold an instance of Web3
  const [ethereumProvider, setEthersProvider] =
    useState<ethers.providers.Web3Provider | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);

  // Initialize Web3
  const initializeWeb3 = async () => {
    console.log(`[INFO] {{Web3Context}} initializeWeb3()...`);
    // Get the provider from the Magic instance
    const magic = await getMagic(true);
    const onboardProvider = await magic.wallet.getProvider();
    console.log(`[INFO] {{Web3Context}}: `, { onboardProvider });
    // Create a new instance of Web3 with the provider
    const provider = new ethers.providers.Web3Provider(onboardProvider||defaultProvider, "any");
    provider.on("network", (newNetwork, oldNetwork) => {
      // When a Provider makes its initial connection, it emits a "network"
      // event with a null oldNetwork along with the newNetwork. So, if the
      // oldNetwork exists, it represents a changing network
      if (oldNetwork && oldNetwork.chainId !== newNetwork.chainId) {
        console.log(`[INFO] {{Web3Context}} initializeWeb3() network changed: `, {
          newNetwork,
          oldNetwork,
        });
        setChainId(() => Number(newNetwork.chainId));
      }
    });
    // Save the instance to state
    setEthersProvider(() => provider);
    return provider;
  };

  const switchNetwork = async (chainId: number) => {
    const chain = CHAIN_AVAILABLES.find((c) => c.id === chainId);
    const isMagic = (ethereumProvider as any)?.provider?.sdk?.rpcProvider
      ?.isMagic;
    console.log(
      "{{NetworkButton}} handleSwitchNetwork(): ethereumProvider",
      isMagic,
      Number(BigInt(chainId).toString())
    );
    // save the new chainId to localstorage
    localStorage.setItem(
      "default-chainId",
      `${Number(BigInt(chainId).toString())}`
    );
    try {
      if (!isMagic && ethereumProvider) {
        // convert decimal to hexa
        const hexaChainId = `0x${Number(BigInt(chainId).toString()).toString(
          16
        )}`;
        await ethereumProvider?.provider.request?.({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: hexaChainId }],
        });
        // handle switch network success
        await new Promise((resolve, reject) => {
          ethereumProvider?.on("network", (newNetwork, oldNetwork) => {
            // When a Provider makes its initial connection, it emits a "network"
            // event with a null oldNetwork along with the newNetwork. So, if the
            // oldNetwork exists, it represents a changing network
            if (oldNetwork && oldNetwork.chainId !== newNetwork.chainId && newNetwork.chainId === chainId) {
              console.log(`[INFO] {{Web3Context}} initializeWeb3() network changed: `, {
                newNetwork,
                oldNetwork,
              });
              resolve(() => Number(newNetwork.chainId));
            }
          });
        }); 
        console.log("{{NetworkButton}} handleSwitchNetwork(): requested...");
        return ethereumProvider;
      } else {
        const updatedProvider = await initializeWeb3();
        return updatedProvider;
      }
      // save the new chainId to localstorage
    } catch (error: any) {
      console.log("{{NetworkButton}} handleSwitchNetwork(): error", error);
      // This error code indicates that the chain has not been added to MetaMask.
      if (error.code === 4902 && chain) {
        try {
          await ethereumProvider?.provider.request?.({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x" + Number(BigInt(chainId).toString()),
                chainName: chain.name,
                nativeCurrency: {
                  name: chain.nativeSymbol,
                  symbol: chain.nativeSymbol,
                  decimals: 18,
                },
                rpcUrls: [(await getRPCNodeOptions()).rpcUrl],
              },
            ],
          });
        } catch (addError) {
          console.log(
            "{{NetworkButton}} handleSwitchNetwork(): addError",
            addError
          );
          // handle "add" error
        }
      }
    }
  };

  // Effect to initialize Web3 when the component mounts
  useEffect(() => {
    initializeWeb3();
    return () => {};
  }, [chainId]);

  return (
    <Web3Context.Provider
      value={{
        ethereumProvider,
        initializeWeb3,
        switchNetwork,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};
