import React, { createContext, useContext, useEffect, useState } from "react";
import { useEthersProvider } from "./Web3Context";
import {
  FormatReserveUSDResponse,
  FormatUserSummaryAndIncentivesResponse,
  FormatUserSummaryResponse,
  formatReserves,
  formatReservesAndIncentives,
} from "@aave/math-utils";
import {
  ReserveDataHumanized,
  UiPoolDataProvider,
  WalletBalanceProvider,
} from "@aave/contract-helpers";
import { ethers } from "ethers";

import { useUser } from "./UserContext";
import {
  MARKETTYPE,
  fetchTVL,
  getMarkets,
  getPools,
  getUserSummary,
  getUserSummaryAndIncentives,
} from "../servcies/aave.service";
import { useCurrentTimestamp } from "../hooks/useCurrentTimestamp";
import dayjs from "dayjs";

export type ComputedReserveData = ReturnType<
  typeof formatReservesAndIncentives
>[0] &
  ReserveDataHumanized & {
    iconSymbol: string;
    isEmodeEnabled: boolean;
    isWrappedBaseAsset: boolean;
  };

export type ExtendedFormattedUser =
  FormatUserSummaryAndIncentivesResponse<ComputedReserveData> & {
    earnedAPY: number;
    debtAPY: number;
    netAPY: number;
    isInEmode: boolean;
    userEmodeCategoryId: number;
  };

const stub = (): never => {
  throw new Error("You forgot to wrap your component in <AaveProvider>.");
};

// Define the type for the user context.
type AaveContextType = {
  markets: MARKETTYPE | null;
  poolReserves: (ReserveDataHumanized & FormatReserveUSDResponse)[] | null;
  userSummary: FormatUserSummaryAndIncentivesResponse<
    ReserveDataHumanized & FormatReserveUSDResponse
  > | null;
  userSummaryAndIncentives: FormatUserSummaryAndIncentivesResponse<ReserveDataHumanized & FormatReserveUSDResponse>|null;
  totalTVL: number | null;
  refresh: () => Promise<void>;
};

const AaveContextDefault: AaveContextType = {
  markets: null,
  poolReserves: null,
  userSummary: null,
  totalTVL: null,
  userSummaryAndIncentives: null,
  refresh: stub,
};

// Create a context for user data.
const AaveContext = createContext<AaveContextType>(AaveContextDefault);

// Custom hook for accessing user context data.
export const useAave = () => useContext(AaveContext);

// Provider component that wraps parts of the app that need user context.
export const AaveProvider = ({ children }: { children: React.ReactNode }) => {
  const { ethereumProvider } = useEthersProvider();
  const { user } = useUser();
  const currentTimestamp = dayjs().unix(); // useCurrentTimestamp(5);
  const [state, setState] = useState<AaveContextType>(AaveContextDefault);

  const init = async () => {
    console.log("[INFO] {{AaveProvider}} init context... ");
    const updatedState: AaveContextType = {
      totalTVL: await fetchTVL().catch((error) => {
        console.error("[ERROR] {{AaveProvider}} fetchTVL: ", error);
        return -1;
      }),
    } as AaveContextType;

    if (ethereumProvider?.network?.chainId) {
      updatedState.markets = getMarkets(ethereumProvider.network.chainId);;
    } else {
      updatedState.markets = null;
    }

    if (ethereumProvider && !user) {
      updatedState.userSummary = null;
      updatedState.userSummaryAndIncentives = null;
    }

    if (ethereumProvider && state.markets) {
      updatedState.poolReserves = await getPools({
        provider: ethereumProvider,
        market: state.markets,
        currentTimestamp,
      })
      .catch((error) => {
        console.error("[ERROR] {{AaveProvider}} fetchPools: ", error);
        return null;
      });
    } else {
      updatedState.poolReserves = null;
    }
    
    if (ethereumProvider && state.markets && user) {
      updatedState.userSummaryAndIncentives = await getUserSummaryAndIncentives({
        provider: ethereumProvider,
        market: state.markets,
        user,
        currentTimestamp,
      })
      .catch((error) => {
        console.error("[ERROR] {{AaveProvider}} fetchUserSummary: ", error);
        return null;
      });
    } else {
      updatedState.userSummaryAndIncentives = null;
    }

    setState((prev) => ({
      ...prev,
      ...updatedState,
    }));
  };

  useEffect(() => {
    init();
    return () => {};
  }, [ethereumProvider?.network?.chainId, user, state.markets]);

  return (
    <AaveContext.Provider
      value={{
        ...state,
        refresh: async () => {
          console.log("[INFO] {{AaveProvider}} refresh... ");
          let t = undefined;
          await new Promise((resolve) => {
            t = setTimeout(resolve, 10000);
          });
          clearTimeout(t);
          await init();
          console.log("[INFO] {{AaveProvider}} refresh done");
        },
      }}
    >
      {children}
    </AaveContext.Provider>
  );
};
