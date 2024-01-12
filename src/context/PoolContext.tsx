import { IPoolGroup, IUserSummary } from "@/interfaces/reserve.interface";
import { createContext, useContext, useEffect, useState } from "react";
import { useAave } from "./AaveContext";
import { useSolend } from "./SolendContext";

const stub = (): never => {
  throw new Error("You forgot to wrap your component in <AaveProvider>.");
};

type PoolsContextType = {
  poolGroups: IPoolGroup[];
  userSummaryAndIncentivesGroup: IUserSummary[] | null;
  totalTVL: number | null;
  refresh: (type?: "init" | "userSummary") => Promise<void>;
};

const PoolsContextDefault: PoolsContextType = {
  poolGroups: [],
  totalTVL: null,
  userSummaryAndIncentivesGroup: null,
  refresh: stub,
};

// Create a context for user data.
const PoolsContext = createContext<PoolsContextType>(PoolsContextDefault);

// Custom hook for accessing user context data.
export const usePools = () => useContext(PoolsContext);

// Provider component that wraps parts of the app that need user context.
export const PoolsProvider = ({ children }: { children: React.ReactNode }) => {
  const {
    pools: aavePools,
    refresh: aaveRefresh,
    totalTVL: aaveTotalTVL,
    userSummaryAndIncentivesGroup,
  } = useAave();
  const { pools: solendPools, refresh: solendRefresh } = useSolend();
  const [poolContext, setPoolContexts] =
    useState<PoolsContextType>(PoolsContextDefault);

  const init = async () => {
    const poolsData = [...aavePools, ...solendPools];
    const poolGroups: IPoolGroup[] = poolsData.reduce(
      (acc, pool) => {
        const symbol = pool.symbol||'unknown';
        const chainId = pool.chainId;
        const borrowAPY = pool.borrowAPY;
        const supplyAPY = pool.supplyAPY;
        const supplyBalance = pool.supplyBalance;
        const borrowBalance = pool.borrowBalance;
          // build group
        const poolGroup = acc.find((g) => g.symbol === pool.symbol);
        if (poolGroup) {
          // add reserve to existing reserves group with wallet balance
          poolGroup.pools.push(pool);
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
          poolGroup.totalBorrowBalance += borrowBalance;
          // update totalSupplyBalance
          poolGroup.totalSupplyBalance += supplyBalance;
          // update totalWalletBalance
          poolGroup.totalWalletBalance += pool.walletBalance;
          // update borrowingEnabled if is disable and pool is enabled
          if (pool.borrowingEnabled && !poolGroup.borrowingEnabled) {
            poolGroup.borrowingEnabled = pool.borrowingEnabled;
          }
          // add priceInUSD if not exist
          if (!poolGroup.priceInUSD) {
            poolGroup.priceInUSD = pool.priceInUSD;
          }
        } else {
          const newGroup: IPoolGroup = {
            pools: [pool],
            symbol,
            name: pool.name,
            chainIds: [chainId],
            logo: pool.logo || "",
            topBorrowApy: borrowAPY,
            topSupplyApy: supplyAPY,
            borrowingEnabled: pool.borrowingEnabled,
            totalBorrowBalance: borrowBalance,
            totalSupplyBalance: supplyBalance,
            totalWalletBalance: pool.walletBalance,
            priceInUSD: pool.priceInUSD,
          };
          acc.push(newGroup);
        }
        return acc;
      },
      [] as IPoolGroup[]
    )
    .sort((a, b) => {
      if (a.totalSupplyBalance > b.totalSupplyBalance) return -1;
      if (a.totalSupplyBalance < b.totalSupplyBalance) return 1;
      if (a.totalBorrowBalance > b.totalBorrowBalance) return -1;
      if (a.totalBorrowBalance < b.totalBorrowBalance) return 1;
      if (a.totalWalletBalance > b.totalWalletBalance) return -1;
      if (a.totalWalletBalance < b.totalWalletBalance) return 1;
      return a.symbol > b.symbol ? 1 : -1;
    });
    console.log("[INFO] {{PoolsProvider}} init context... ", poolGroups ); 
    const refresh = async (type: "init" | "userSummary" = "init") => {
      await aaveRefresh(type);
      await solendRefresh(type);
    };
    const totalTVL = [aaveTotalTVL].reduce(
      (acc: number, tvl: number | null) => {
        return acc + (tvl || 0);
      },
      0
    );
    setPoolContexts((prev) => ({
      ...prev,
      totalTVL,
      poolGroups,
      refresh,
      userSummaryAndIncentivesGroup,
    }));
  };

  useEffect(() => {
    init();
  }, [solendPools, aavePools])

  return (
    <PoolsContext.Provider
      value={{
        ...poolContext,
      }}
    >
      {children}
    </PoolsContext.Provider>
  );
};
