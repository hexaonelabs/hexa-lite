
import React, { createContext, useContext, useEffect, useState } from "react"
import { magic } from "../servcies/magic";
import { ethers } from 'ethers';

// Define the structure of the Web3 context state
type Web3ContextType = {
  ethereum: ethers.providers.Web3Provider | null
  initializeWeb3: () => Promise<ethers.providers.Web3Provider>
}

// Create the context with default values
const Web3Context = createContext<Web3ContextType>({
  ethereum: null,
  initializeWeb3: () => Promise.resolve(null as any),
})

// Custom hook to use the Web3 context
export const useEthersProvider = () => useContext(Web3Context)

// Provider component to wrap around components that need access to the context
export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  // State variable to hold an instance of Web3
  const [ethereum, setEthersProvider] = useState<ethers.providers.Web3Provider | null>(null)

  // Initialize Web3
  const initializeWeb3 = async () => {
    // Get the provider from the Magic instance
    const onboardProvider = await magic.wallet.getProvider();
    console.log("onboardProvider", onboardProvider);
    // Create a new instance of Web3 with the provider
    const provider = new ethers.providers.Web3Provider(onboardProvider, 'any');
    const signer = provider.getSigner();

    // Save the instance to state
    setEthersProvider(provider);
    return provider;
  }

  // Effect to initialize Web3 when the component mounts
  useEffect(() => {
    initializeWeb3()
  }, [])

  return (
    <Web3Context.Provider
      value={{
        ethereum,
        initializeWeb3,
      }}
    >
      {children}
    </Web3Context.Provider>
  )
}