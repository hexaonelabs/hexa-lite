
import React, { createContext, useContext, useEffect, useState } from "react"
import { useEthersProvider } from "./Web3Context"
import { getTokensBalances } from "../servcies/ankr.service";
import { ethers } from "ethers";

export interface IAsset  {
  chain: {
    id: number;
    value: string;
    name: string;
    nativeSymbol?: string;
  } | undefined;
  name: string;
  symbol: string;
  decimals: number;
  type: string;
  balance: number;
  balanceRawInteger: string;
  balanceUsd: number;
  priceUsd: number;
  thumbnail: string;
  contractAddress: string | undefined;
}

// Define the type for the user context.
type UserContextType = {
  user: string | null;
  assets: IAsset[] | null;
  refresh: () => Promise<void>;
};

const stub = (): never => {
  throw new Error("You forgot to wrap your component in <UserProvider>.");
};

// Function to retrieve and set user's account.
const fetchUserAccount = async (provider: ethers.providers.Web3Provider) => {
  // Use 'ethers' to get user's accounts.
  try {      
    const accounts = await provider?.listAccounts();
    // Update the user state with the first account (if available), otherwise set to null.
    return accounts ? accounts[0] : null;
  } catch (error) {
    return null;
  }
}

const fetchUserAssets = async (user: string) => {
  console.log(`[INFO] {UserContext} fetchUserAssets()`, user);
  if (!user) return null;
  const assets = await getTokensBalances(
    [], user
  );
  return assets;
}

// Create a context for user data.
const UserContext = createContext<UserContextType>({
  user: null,
  assets: null,
  refresh: stub,
})

// Custom hook for accessing user context data.
export const useUser = () => useContext(UserContext)

// Provider component that wraps parts of the app that need user context.
export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  // Use the web3 context.
  const { ethereumProvider } = useEthersProvider();

  // Initialize user state to hold user's account information.
  const [state, setState] = useState<UserContextType>({
    user: null,
    assets: null,
    refresh: stub,
  });

  const init = async () => {
    if (!ethereumProvider) return;
    console.log("[INFO] {{UserProvider}} init context... ");
    const user = await fetchUserAccount(ethereumProvider);
    const assets = user ?  await fetchUserAssets(user) : null;
    
    setState((prev) => ({
      ...prev,
      user,
      assets
    }));
  };

  // Run fetchUserAccount function whenever the web3 instance changes.
  useEffect(() => {
    if (!ethereumProvider) return;
    init()
    return () => {};
  }, [ethereumProvider])

  return (
    <UserContext.Provider
      value={{
        ...state,
        refresh: async () => {
          console.log("[INFO] {{UserProvider}} refresh context... ");
          let t = undefined;
          await new Promise((resolve) => {
            t = setTimeout(resolve, 10000);
          });
          clearTimeout(t);
          await init();
          console.log("[INFO] {{UserProvider}} refresh context done");
        },
      }}
    >
      {children}
    </UserContext.Provider>
  )
}