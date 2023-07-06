
import React, { createContext, useContext, useEffect, useState } from "react"
import { useEthersProvider } from "./Web3Context"
import { getTokensBalances } from "../servcies/ankr.service";

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
  user: string | null,
  assets: IAsset[] | null
};

// Create a context for user data.
const UserContext = createContext<UserContextType>({
  user: null,
  assets: null
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
  });

  // Function to retrieve and set user's account.
  const fetchUserAccount = async () => {
    // Use 'ethers' to get user's accounts.
    try {      
      const accounts = await ethereumProvider?.listAccounts();
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

  // Run fetchUserAccount function whenever the web3 instance changes.
  useEffect(() => {
    if (!ethereumProvider) return;
    fetchUserAccount()
      .then(async (user) => {
        const assets = user ?  await fetchUserAssets(user) : null;
        return {
          user,
          assets
        }
      })
      .then((data) => {
        console.log(`[INFO] {UserContext} useEffect()`, data);
        
        setState(data);
      });
    return () => {};
  }, [ethereumProvider])

  return (
    <UserContext.Provider
      value={{
        ...state,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}