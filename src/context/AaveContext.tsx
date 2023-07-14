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

  useEffect(() => {
    if (ethereumProvider?.network?.chainId) {
      const markets = getMarkets(ethereumProvider.network.chainId);
      setState((prev) => ({
        ...prev,
        markets,
      }));
    }
    if (ethereumProvider && !user) {
      setState((prev) => ({
        ...prev,
        userSummary: null,
        userSummaryAndIncentives: null,
      }));
    }

    const promises = [];
    promises.push(
      fetchTVL().then((tvl) => {
        setState((prev) => ({
          ...prev,
          totalTVL: tvl,
        }));
        return { tvl };
      })
    );
    if (ethereumProvider && state.markets) {
      promises.push(
        getPools({
          provider: ethereumProvider,
          market: state.markets,
          currentTimestamp,
        })
        .then((poolReserves) => {
          setState((prev) => ({
            ...prev,
            poolReserves,
          }));
          return { poolReserves };
        })
        .catch((error) => {
          console.error("[ERROR] {{AAVEService}} fetchPools: ", error);
          setState((prev) => ({
            ...prev,
            poolReserves: null,
          }));
        })
      );
    }
    if (ethereumProvider && state.markets && user) {
      promises.push(
        getUserSummaryAndIncentives({
          provider: ethereumProvider,
          market: state.markets,
          user,
          currentTimestamp,
        })
          .then(userSummaryAndIncentives =>  {
            setState((prev) => ({
              ...prev,
              userSummaryAndIncentives,
            }));
            return { userSummaryAndIncentives };
          })
          .catch((error) => {
            console.error("[ERROR] {{AAVEService}} fetchUserSummary: ", error);
            setState((prev) => ({
              ...prev,
              userSummary: null,
            }));
          })
      );
    }
    Promise
      .all(promises)
      .then((results) => {
        console.log("[INFO] {{AAVEService}} fetchPools done", { results });
      });
    return () => {};
  }, [ethereumProvider?.network?.chainId, user, state.markets]);

  return (
    <AaveContext.Provider
      value={{
        ...state,
        refresh: async () => {
          let t = undefined;
          await new Promise((resolve) => {
            t = setTimeout(resolve, 10000);
          });
          console.log("[INFO] {{AAVEService}} refresh... ");
          clearTimeout(t);
          alert('Refresh application to see updated amounts.')
          // throw new Error("Not implemented");
          // const chainId = await getNetwork();
          // const markets = await fetchMarkets(chainId);
          // await fetchPools(markets);
          // await fetchUserSummary(user, markets);
        },
      }}
    >
      {children}
    </AaveContext.Provider>
  );
};
