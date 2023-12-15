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
  poolGroups: IPoolGroup[];
  userSummaryAndIncentivesGroup: IUserSummary[] | null;
  totalTVL: number | null;
  refresh: (type?: 'init'|'userSummary') => Promise<void>;
};

const AaveContextDefault: AaveContextType = {
  markets: null,
  poolGroups: [],
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
    console.log("[INFO] {{AaveProvider}} fetchPools... ");
    const reserves = await Promise.all(
      markets.map((market) => getPools({ market, currentTimestamp }))
    )
    .then((r) => r.flat())
    .catch((error) => {
      console.error("[ERROR] {{AaveProvider}} fetchPools: ", error);
      return [];
    });
    console.log("[INFO] {{AaveProvider}} fetchPools done: ", { reserves });

    // groups poolReserves by symbol (e.g. DAI, USDC, USDT, ...)
    const poolGroups: IPoolGroup[] = reserves        
      .filter(reserve => 
        reserve.isFrozen === false 
        && reserve.isActive === true 
        && reserve.isPaused === false 
      )
      .reduce((acc, reserve) => {
        const symbol = reserve.symbol;
        const chainId = +reserve.id.split("-")[0];
        const borrowAPY = reserve
          ? Number(reserve.variableBorrowAPY)
          : 0;
        const supplyAPY = Number(reserve.supplyAPY);
        /// TODO: implement value
        const walletBalance = 0;
        const supplyBalance = 0;
        const borrowBalance = 0;
        const userLiquidationThreshold = -1;
        const marketPool = MarketPool.create<AavePool>({
          ...reserve,
          provider: 'aave-v3',
          logo: getAssetIconUrl({ symbol: reserve.symbol }),
          chainId,
          borrowAPY,
          supplyAPY,
          walletBalance,
          supplyBalance,
          borrowBalance,
          userLiquidationThreshold
        });
        const poolGroup = acc.find((r) => r.symbol === symbol);
        if (poolGroup) {
          // add reserve to existing reserves group
          poolGroup.pools.push(marketPool);
          // check if chainId exist and add if not
          if (!poolGroup.chainIds.includes(chainId)) {
            poolGroup.chainIds.push(chainId);
          }
          // check if borrowApy is lower than topBorrowApy
          if (borrowAPY < poolGroup.topBorrowApy) {
            poolGroup.topBorrowApy = borrowAPY;
          }
          // check if supplyApy is higher than topSupplyApy
          if (supplyAPY > poolGroup.topSupplyApy) {
            poolGroup.topSupplyApy = supplyAPY;
          }
          // update totalBorrowBalance
          poolGroup.totalBorrowBalance += Number(marketPool.borrowBalance);
          // update totalSupplyBalance
          poolGroup.totalSupplyBalance += Number(marketPool.supplyBalance);
          // update totalWalletBalance
          poolGroup.totalWalletBalance += Number(marketPool.walletBalance);
          // update borrowingEnabled if is disable and marketPool is enabled
          if (marketPool.borrowingEnabled && !poolGroup.borrowingEnabled) {
            poolGroup.borrowingEnabled = marketPool.borrowingEnabled;
          }
          // add priceInUSD if not exist
          if (!poolGroup.priceInUSD) {
            poolGroup.priceInUSD = marketPool.priceInUSD;
          }
        } else {
          const newGroup: IPoolGroup = {
            pools: [marketPool],
            symbol,
            name: marketPool.name,
            chainIds: [chainId],
            logo: getAssetIconUrl({ symbol }),
            topBorrowApy: borrowAPY,
            topSupplyApy: supplyAPY,
            borrowingEnabled: marketPool.borrowingEnabled,
            totalBorrowBalance: borrowBalance,
            totalSupplyBalance: supplyBalance,
            totalWalletBalance: walletBalance,
            priceInUSD: marketPool.priceInUSD,
          };
          acc.push(newGroup);
        }
        return acc;
      }, [] as IPoolGroup[])
      // sort by existing ballances then by name
      .sort((a, b) => {
        if (a.symbol < b.symbol) return -1;
        if (a.symbol > b.symbol) return 1;
        return 0;
      });
    // update state
    setState((prev) => ({
      ...prev,
      markets,
      poolGroups,
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
      console.log("[INFO] {{AaveProvider}} fetchUserSummaryAndIncentives: ", {
        userSummaryAndIncentivesGroup,
      });
      // update `poolGroups.` with userSummaryAndIncentives data
      if (
        userSummaryAndIncentivesGroup &&
        state.poolGroups &&
        state.poolGroups.length > 0
      ) {
        const poolGroups = state.poolGroups.map((poolGroup) => {
          const symbol = poolGroup.symbol;
          const borrowingEnabled = poolGroup.borrowingEnabled;
          // get `totalBorrowBalance`from  for a specific `symbol` using `userSummaryAndIncentivesGroup` Object
          // to calculate `borrowBalance` for each network and sum them up to get `totalBorrowBalance`
          const totalBorrowBalance = getTotalBorrowBalanceBySymbol(
            userSummaryAndIncentivesGroup,
            symbol
          );
          // get `totalSupplyBalance`from  for a specific `symbol` using `userSummaryAndIncentivesGroup` Object
          // to calculate `supplyBalance` for each network and sum them up to get `totalBorrowBalance`
          const totalSupplyBalance = getTotalSupplyBalanceBySymbol(
            userSummaryAndIncentivesGroup,
            symbol
          );
          const assetFromAllNetwork = getAssetFromAllNetwork({
            assets, symbol, userSummaryAndIncentivesGroup
          });
          const totalWalletBalance = assetFromAllNetwork.reduce((acc, asset) => {
            return acc + asset.balance;
          }, 0) || 0;
          // implememnt `supplyBalance` and `borrowBalance` for each reserve from poolGroup
          const pools = poolGroup.pools
          .map((pool) => {
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
            const walletBalance = assetFromAllNetwork.find(
              (asset) => asset.chain?.id === pool.chainId 
              && asset.contractAddress === pool.underlyingAsset
            )?.balance || 0;
            // get `userLiquidationThreshold` from `userSummaryAndIncentivesGroup` Object
            const userLiquidationThreshold = userSummaryAndIncentivesGroup
            .find((userSummary) => userSummary.chainId === pool.chainId)?.currentLiquidationThreshold;
            // return `reserve` Object with `supplyBalance` and `borrowBalance` from `userReserve` Object
            // and `totalWalletBalance` from `userAssets` Object
            return MarketPool.create<AavePool>({
              ...pool,
              provider: 'aave-v3',
              supplyBalance: Number(userReserve?.underlyingBalance) || 0,
              borrowBalance: Number(userReserve?.totalBorrows) || 0,
              walletBalance,
              userLiquidationThreshold: Number(userLiquidationThreshold)
            });
          })
          .sort((a, b) => {
            if (a.supplyBalance > b.supplyBalance) return -1;
            if (a.supplyBalance < b.supplyBalance) return 1;
            if (a.borrowBalance > b.borrowBalance) return -1;
            if (a.borrowBalance < b.borrowBalance) return 1;
            return 0;
          });
          const newState: IPoolGroup = {
            ...poolGroup,
            borrowingEnabled,
            totalBorrowBalance,
            totalSupplyBalance,
            totalWalletBalance,
            pools,
          };
          return newState;
        })
        // sort by existing ballances then by walletbalance then by symbol
        .sort((a, b) => {
          if (a.totalSupplyBalance > b.totalSupplyBalance) return -1;
          if (a.totalSupplyBalance < b.totalSupplyBalance) return 1;
          if (a.totalBorrowBalance > b.totalBorrowBalance) return -1;
          if (a.totalBorrowBalance < b.totalBorrowBalance) return 1;
          if (a.totalWalletBalance > b.totalWalletBalance) return -1;
          if (a.totalWalletBalance < b.totalWalletBalance) return 1;
          if (a.symbol < b.symbol) return -1;
          if (a.symbol > b.symbol) return 1;
          return 0;
        })
        console.log("[INFO] {{AaveProvider}} updated poolGroups: ", {
          poolGroups,
        });
        // update `poolGroups.` with userSummaryAndIncentivesGroup
        setState((prev) => ({
          ...prev,
          userSummaryAndIncentivesGroup,
          poolGroups,
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
