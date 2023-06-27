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
import { MARKETTYPE, formatUserSummaryAndIncentives, getMarkets, getPools } from "../servcies/aave.service";


const stub = (): never => {
  throw new Error("You forgot to wrap your component in <AaveProvider>.");
};

// Define the type for the user context.
type AaveContextType = {
  markets: MARKETTYPE | null;
  poolReserves: (ReserveDataHumanized & FormatReserveUSDResponse)[] | null;
  totalTVL: number | null;
  // walletBallance: (ReserveDataHumanized &
  //   FormatReserveUSDResponse & { balance: string; tokenAddress: string })[];
};

const AaveContextDefault: AaveContextType = {
  markets: null,
  poolReserves: null,
  totalTVL: null,
};

// Create a context for user data.
const AaveContext = createContext<AaveContextType>(AaveContextDefault);

// Custom hook for accessing user context data.
export const useAave = () => useContext(AaveContext);

// Provider component that wraps parts of the app that need user context.
export const AaveProvider = ({ children }: { children: React.ReactNode }) => {
  const { ethereum } = useEthersProvider();
  const [ state, setState ] = useState<AaveContextType>(AaveContextDefault);

  // const [ markets, setMarkets ] = useState<MARKETTYPE | null>(null);
  // const [ poolReserves, setPoolReserves ] = useState<(ReserveDataHumanized & FormatReserveUSDResponse)[] | null>(null);
  // const [ totalTVL, setTotalTVL ] = useState<number | null>(null);

  const fetchTVL = async () => {
    const response = await fetch('https://api.llama.fi/tvl/aave');
    const data = await response.json();
    console.log("[INFO] {{AAVEService}} fetchTVL: ", data);
    setState((prev) => ({
      ...prev,
      totalTVL: data
    }));
    return data;
  };

  const fetchMarkets = async (chainId: number) => {
    // get markets
    const markets = getMarkets(chainId);
    setState((prev) => ({
      ...prev,
      markets
    }));
    return markets;
  };
  
  // Function to retrieve and set user's account.
  const fetchPools = async (market?: MARKETTYPE | null) => {
    const sampleProvider = new ethers.providers.JsonRpcProvider(
      "https://rpc.ankr.com/eth"
    );
    if (!market) {
      setState(((prev) => ({
        ...prev, 
        markets: null,
        poolReserves: null
      })));
      return;
    }
    const formattedPoolReserves = await getPools({
      provider: ethereum || sampleProvider,
      market
    });
    console.log("[INFO] {{AAVEService}} fetchPools: ", formattedPoolReserves);
    setState(((prev) => ({
      ...prev, 
      poolReserves: formattedPoolReserves
    })));
  };

  // build getNetwork promise with default value 1 (mainnet)
  const getNetwork = async () => await new Promise(async (resolve: (value: number) => void, reject) => {
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
    fetchTVL()
      .then(() => getNetwork())
      .then((chainId: number) => fetchMarkets(chainId))
      .then((m) => fetchPools(m));
    return () => {
    };
  }, [ethereum,state.markets]);

  return (
    <AaveContext.Provider
      value={state}
    >
      {children}
    </AaveContext.Provider>
  );
};
