'use client'

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  FormatUserSummaryAndIncentivesResponse,
  formatReservesAndIncentives,
} from "@aave/math-utils";
import {
  ReserveDataHumanized,
} from "@aave/contract-helpers";
import {
  MARKETTYPE,
  fetchTVL,
  getMarkets,
  getPools,
  getUserSummaryAndIncentives,
} from "../servcies/aave.service";
// import { useCurrentTimestamp } from "../hooks/useCurrentTimestamp";
import dayjs from "dayjs";
import { CHAIN_AVAILABLES } from "../constants/chains";
import {
  IPoolGroup,
  IReserve,
  IUserSummary,
} from "../interfaces/reserve.interface";
import { getAssetIconUrl } from "../utils/getAssetIconUrl";
import { getTotalSupplyBalanceBySymbol } from "../utils/getTotalSupplyBalanceBySymbol";
import { getTotalBorrowBalanceBySymbol } from "../utils/getTotalBorrowBalanceBySymbol";
import { getAssetFromAllNetwork } from "../utils/getAssetFromAllNetwork";
import { useWeb3Provider } from "./Web3Context";
import { MarketPool } from "@/pool/Market.pool";
import { AavePool } from "@/pool/Aave.pool";

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

// Define the type for the AAVE context.
type AaveContextType = {
  markets: MARKETTYPE[] | null;
  pools: AavePool[];
  userSummaryAndIncentivesGroup: IUserSummary[] | null;
  totalTVL: number | null;
  refresh: (type?: 'init'|'userSummary') => Promise<void>;
};

const AaveContextDefault: AaveContextType = {
  markets: null,
  pools: [],
  totalTVL: null,
  userSummaryAndIncentivesGroup: null,
  refresh: stub,
};

// Create a context for user data.
const AaveContext = createContext<AaveContextType>(AaveContextDefault);

// Custom hook for accessing user context data.
export const useAave = () => useContext(AaveContext);

// Provider component that wraps parts of the app that need user context.
export const AaveProvider = ({ children }: { children: React.ReactNode }) => {
  const currentTimestamp = dayjs().unix(); // useCurrentTimestamp(5);
  const [ state, setState ] = useState<AaveContextType>(AaveContextDefault);
  const { assets, walletAddress } = useWeb3Provider();

  const init = async () => {
    console.log("[INFO] {{AaveProvider}} init context... ");
    // load markets from all available chains
    const markets = CHAIN_AVAILABLES.filter((chain) => !chain.testnet)
    .map(
      (chain) => {
        let market: MARKETTYPE | null = null;
        try {
          market = getMarkets(chain.id);
        } catch (error: any) {
          console.log(error?.message);
        }
        return market;
      }
    )
    .filter(Boolean) as MARKETTYPE[];
    // load pools from all available chains
    if (!markets || markets.length === 0) {
      return;
    }
    // console.log("[INFO] {{AaveProvider}} fetchPools... ");
    const reserves = [];
    for (let i = 0; i < markets.length; i++) {
      const market = markets[i];
      const pools = await getPools({ market, currentTimestamp })
      .then((r) => r.flat())
      .catch((error) => {
        console.error("[ERROR] {{AaveProvider}} fetchPools: ", error);
        return [];
      });
      reserves.push(...pools);
    }
    // console.log("[INFO] {{AaveProvider}} fetchPools done: ", { reserves });
    // groups poolReserves by symbol (e.g. DAI, USDC, USDT, ...)
    const pools: AavePool[] = reserves        
      .filter(reserve => 
        reserve.isFrozen === false 
        && reserve.isActive === true 
        && reserve.isPaused === false 
      )
      .map((reserve) => {
          const provider = 'aave-v3';
          const symbol = reserve.symbol;
          const chainId = +reserve.id.split("-")[0];
          const logo = getAssetIconUrl({ symbol })
          const borrowAPY = reserve
            ? Number(reserve.variableBorrowAPY)
            : 0;
          const supplyAPY = Number(reserve.supplyAPY||0);
          const walletBalance = 0;
          const supplyBalance = 0;
          const borrowBalance = 0;
          const userLiquidationThreshold = -1;
          const poolLiquidationThreshold = Number(reserve.formattedEModeLiquidationThreshold);
        return MarketPool.create<AavePool>({
          ...reserve,
          symbol,
          provider,
          supplyBalance,
          borrowBalance,
          walletBalance,
          borrowAPY,
          supplyAPY,
          chainId,
          userLiquidationThreshold,
          poolLiquidationThreshold,
          logo,
        });
      });
    // update state
    setState((prev) => ({
      ...prev,
      pools,
      markets,
    }));
  };

  const loadUserSummary = async () => {
    console.log("[INFO] {{AaveProvider}} loadUserSummary... ");
    // load data from all available networks
    if (walletAddress && state.markets && state.markets.length > 0) {
      const userSummaryAndIncentivesGroup = await Promise.all(
        state.markets.map((market) =>
          getUserSummaryAndIncentives({ market, currentTimestamp, user: walletAddress })
        )
      )
      .then((r) => r as IUserSummary[])
      .catch((error) => {
        console.error(
          "[ERROR] {{AaveProvider}} fetchUserSummaryAndIncentives: ",
          error
        );
        return null;
      });
      // update `poolGroups.` with userSummaryAndIncentives data
      if (
        userSummaryAndIncentivesGroup &&
        state.pools &&
        state.pools.length > 0
      ) {
        
        const pools = state.pools.map((pool) => {
          const userReserve = userSummaryAndIncentivesGroup
            .find((userSummary) => userSummary.chainId === pool.chainId)
            ?.userReservesData
            ?.find((userReserve) => {
              const {
                reserve: { symbol },
              } = userReserve;
              if (symbol === pool.symbol) {
                return userReserve.reserve;
              }
              return null;
            });
          const supplyBalance = Number(userReserve?.underlyingBalance) || 0;
          const borrowBalance = Number(userReserve?.totalBorrows) || 0;
          // get wallet balance for this pool asset
          const walletBalance = assets.find(
            (a) => a.symbol === pool.symbol && a.chain?.id === pool.chainId && a.contractAddress === pool.underlyingAsset
          )?.balance || 0;
          const poolLiquidationThreshold =  Number(userReserve?.reserve?.formattedReserveLiquidationThreshold||-1);
          // get `userLiquidationThreshold` from `userSummaryAndIncentivesGroup` Object
          const {currentLiquidationThreshold: userLiquidationThreshold = -1} = userSummaryAndIncentivesGroup.find(
            (userSummary) => userSummary.chainId === pool.chainId
          )||{}
          // return `reserve` Object with `supplyBalance` and `borrowBalance` from `userReserve` Object
          // and `totalWalletBalance` from `userAssets` Object
          return MarketPool.create<AavePool>({
            ...pool,
            supplyBalance,
            borrowBalance,
            walletBalance,
            userLiquidationThreshold: Number(userLiquidationThreshold),
            poolLiquidationThreshold
          });
        })
        .sort((a, b) => {
          if (a.supplyBalance > b.supplyBalance) return -1;
          if (a.supplyBalance < b.supplyBalance) return 1;
          if (a.borrowBalance > b.borrowBalance) return -1;
          if (a.borrowBalance < b.borrowBalance) return 1;
          if (a.walletBalance > b.walletBalance) return -1;
          if (a.walletBalance < b.walletBalance) return 1;
          return 0;
        })
        console.log("[INFO] {{AaveProvider}} updated pools: ", {
          pools,
        });
        setState((prev) => ({
          ...prev,
          userSummaryAndIncentivesGroup,
          pools,
        }));
        console.log("[INFO] {{AaveProvider}} loadUserSummary loaded " );
      }
    } else if (!walletAddress && state.userSummaryAndIncentivesGroup) {
      console.log("[INFO] {{AaveProvider}} loadUserSummary user not loged. Reset data state. " );
      setState((prev) => ({
        ...prev,
        userSummaryAndIncentivesGroup: null,
      }));
      init();
    } else {
      console.log("[INFO] {{AaveProvider}} loadUserSummary nothing to do " );
    }
  };

  useEffect(() => {
    init();
    fetchTVL()
    .then((totalTVL) => {
      setState((prev) => ({
        ...prev,
        totalTVL,
      }));
    })
    .catch((error) => {
      console.error("[ERROR] {{AaveProvider}} fetchTVL: ", error);
      return -1;
    });
  }, []);

  useEffect(() => {
    loadUserSummary();
  }, [walletAddress, state.markets]);

  return (
    <AaveContext.Provider
      value={{
        ...state,
        refresh: async (type: 'init'|'userSummary' = 'init') => {
          console.log("[INFO] {{AaveProvider}} refresh... ");
          let t = undefined;
          await new Promise((resolve) => {
            t = setTimeout(resolve, 10000);
          });
          clearTimeout(t);
          if (type === 'init') {
            await init();
          }
          if (type === 'userSummary') {
            await loadUserSummary();
          }
          console.log("[INFO] {{AaveProvider}} refresh done with methods: ", type);
        },
      }}
    >
      {children}
    </AaveContext.Provider>
  );
};
