import React, { createContext, useContext, useEffect, useState } from "react";
import { getMagic } from "../servcies/magic";
import { ethers } from "ethers";
import { CHAIN_DEFAULT } from "../constants/chains";

// Define the structure of the Web3 context state
type Web3ContextType = {
  ethereumProvider: ethers.providers.Web3Provider | null;
  initializeWeb3: () => Promise<ethers.providers.Web3Provider>;
};

// Create the context with default values
const Web3Context = createContext<Web3ContextType>({
  ethereumProvider: null,
  initializeWeb3: () => Promise.resolve(null as any),
});

// Custom hook to use the Web3 context
export const useEthersProvider = () => useContext(Web3Context);

// Provider component to wrap around components that need access to the context
export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  // State variable to hold an instance of Web3
  const [ethereumProvider, setEthersProvider] =
    useState<ethers.providers.Web3Provider | null>(null);
  const [chainId, setChainId] = useState<number >(CHAIN_DEFAULT.id);

  // Initialize Web3
  const initializeWeb3 = async () => {
    console.log(`[INFO] {{Web3Context}} initializeWeb3()`);
    // Get the provider from the Magic instance
    const magic = await getMagic(true);
    const onboardProvider = await magic.wallet.getProvider();
    console.log({onboardProvider});
    
    // Create a new instance of Web3 with the provider
    const provider = new ethers.providers.Web3Provider(onboardProvider, "any");
    // const network = await provider.getNetwork();

    provider.on("network", (newNetwork, oldNetwork) => {
      console.log(`[INFO] {{Web3Context}} initializeWeb3() network changed`, {newNetwork, oldNetwork});
      // When a Provider makes its initial connection, it emits a "network"
      // event with a null oldNetwork along with the newNetwork. So, if the
      // oldNetwork exists, it represents a changing network
      if (oldNetwork) {
          window.location.reload();
      }
    });
    // Save the instance to state
    setEthersProvider(provider);
    return provider;
  };

  // Effect to initialize Web3 when the component mounts
  useEffect(() => {
    initializeWeb3();
    return () => {};
  }, []);

  return (
    <Web3Context.Provider
      value={{
        ethereumProvider,
        initializeWeb3
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};
