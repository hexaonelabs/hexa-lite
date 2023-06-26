import React, { createContext, useContext, useEffect, useState } from "react";
import { useEthersProvider } from "./Web3Context";
import { FormatReserveUSDResponse, formatReserves } from "@aave/math-utils";
import {
  ReserveDataHumanized,
  UiPoolDataProvider,
  WalletBalanceProvider,
} from "@aave/contract-helpers";
import { ethers } from "ethers";

import { useUser } from "./UserContext";
import { MARKETTYPE, formatUserSummaryAndIncentives, getMarkets, getWalletBalance } from "../servcies/aave.service";


const stub = (): never => {
  throw new Error("You forgot to wrap your component in <AaveProvider>.");
};

// Define the type for the user context.
type AaveContextType = {
  markets: MARKETTYPE | null;
  walletBallance: (ReserveDataHumanized &
    FormatReserveUSDResponse & { balance: string; tokenAddress: string })[];
};

// Create a context for user data.
const AaveContext = createContext<AaveContextType>({
  markets: null,
  walletBallance: [],
});

// Custom hook for accessing user context data.
export const useAave = () => useContext(AaveContext);

// Provider component that wraps parts of the app that need user context.
export const AaveProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUser();
  const { ethereum } = useEthersProvider();
  const [markets, setMarkets] = useState<MARKETTYPE | null>(null);
  const [userBallance, setUserBallance] = useState<
    | (ReserveDataHumanized &
        FormatReserveUSDResponse & {
          balance: string;
          tokenAddress: string;
        })[]
    | null
  >(null);

  const fetchMarkets = async (chainId: number) => {
    // get markets
    const markets = getMarkets(chainId);
    // set markets
    setMarkets(markets ? markets : null);
    return markets;
  };
  
  // Function to retrieve and set user's account.
  const fetchUserBallance = async (market?: MARKETTYPE | null) => {
    const sampleProvider = new ethers.providers.JsonRpcProvider(
      "https://rpc.ankr.com/eth"
    );
    if (!market) {
      setUserBallance(null);
      return;
    }
    console.log("[INFO] {{AAVEService}} : ");
    const formattedPoolReserves = await getWalletBalance({
      provider: ethereum || sampleProvider,
      market,
      user,
    });

    // Update the user state with the first account (if available), otherwise set to null.
    setUserBallance(
      formattedPoolReserves ? (formattedPoolReserves as any) : null
    );
  };

  // build getNetwork promise with default value 1 (mainnet)
  const getNetwork = () => new Promise(async (resolve: (value: number) => void, reject) => {
    try {
      if (ethereum) {
        const network = await ethereum.getNetwork();
        resolve(network.chainId);
      } else {
        resolve(1);
      }
    } catch (error: any) {
      reject(error as Error)
    }
  });

  useEffect(() => {
    getNetwork()
      .then((chainId: number) => fetchMarkets(chainId))
      .then((m) => fetchUserBallance(m));
  }, []);

  return (
    <AaveContext.Provider
      value={{
        markets,
        walletBallance: userBallance ? userBallance : [],
      }}
    >
      {children}
    </AaveContext.Provider>
  );
};
