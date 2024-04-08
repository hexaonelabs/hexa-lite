import { createSelector  } from "reselect";
import Store, { IStore } from ".";
import { valueToBigNumber } from "@aave/math-utils";
import { getPoolSupplyAndBorrowBallance, getPoolWalletBalance } from "@/utils/getPoolWalletBalance";
import { IPoolGroup } from "@/interfaces/reserve.interface";

const getState = (state: IStore) => state;
const GET_POOL_STATE = createSelector(getState, (state) => state.pools);

// Global state
export const getWeb3State = createSelector(getState, (state) => state.web3);

// Web3 Selectors
export const getWalletAddressState = createSelector(
  getWeb3State,
  (state) => state.walletAddress
);
export const connectWalletState = createSelector(
  getWeb3State,
  (state) => state.connectWallet
);

// Pools Selectors
export const getPoolGroupsState = createSelector(
  getState,
  ({
    pools: { marketPools, userSummaryAndIncentivesGroup },
    web3: { assets },
  }) =>
    marketPools
      .reduce((acc, pool) => {
        // get supply balance from userSummaryAndIncentivesGroup
        const { supplyBalance, borrowBalance } = getPoolSupplyAndBorrowBallance(pool, userSummaryAndIncentivesGroup||[]);
        const walletBalance = getPoolWalletBalance(pool, assets);
        // update pool with balances
        pool.walletBalance = walletBalance;
        pool.supplyBalance = supplyBalance;
        pool.borrowBalance = borrowBalance;
        pool.walletBalance = walletBalance;
        // get pool values to build PoolGroup
        const { 
          symbol = "unknown", 
          chainId, 
          borrowAPY, 
          supplyAPY,
          name, 
          logo = "",
          borrowingEnabled,
          priceInUSD } = pool;
        // build group
        const poolGroup = acc.find((g) => g.symbol === symbol);
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
          poolGroup.totalWalletBalance += walletBalance;
          // update borrowingEnabled if is disable and pool is enabled
          if (borrowingEnabled && !poolGroup.borrowingEnabled) {
            poolGroup.borrowingEnabled = borrowingEnabled;
          }
          // add priceInUSD if not exist
          if (!poolGroup.priceInUSD) {
            poolGroup.priceInUSD = priceInUSD;
          }
        } else {
          // create unique id using Math random with min max
          const id = `${symbol}-${Math.floor(Math.random() * 10000000)}`;
          const newGroup: IPoolGroup = {
            id,
            logo,
            priceInUSD,
            borrowingEnabled,
            symbol,
            name,
            topBorrowApy: borrowAPY,
            topSupplyApy: supplyAPY,
            totalBorrowBalance: borrowBalance,
            totalSupplyBalance: supplyBalance,
            totalWalletBalance: walletBalance,
            chainIds: [chainId],
            pools: [pool],
          };
          acc.push(newGroup);
        }
        return acc;
      }, [] as IPoolGroup[])
      .sort((a, b) => {
        if (a.totalSupplyBalance > b.totalSupplyBalance) return -1;
        if (a.totalSupplyBalance < b.totalSupplyBalance) return 1;
        if (a.totalBorrowBalance > b.totalBorrowBalance) return -1;
        if (a.totalBorrowBalance < b.totalBorrowBalance) return 1;
        if (a.totalWalletBalance > b.totalWalletBalance) return -1;
        if (a.totalWalletBalance < b.totalWalletBalance) return 1;
        return a.symbol > b.symbol ? 1 : -1;
      })
);
export const getMarketPoolsState = createSelector(getPoolGroupsState, (state) => state.flatMap((p) => p.pools));
export const getUserSummaryAndIncentivesGroupState = createSelector(GET_POOL_STATE, (state) => state.userSummaryAndIncentivesGroup);
export const getTotalTVLState = createSelector(
  GET_POOL_STATE,
  (state) => state.totalTVL
);

export const getProtocolSummaryState = createSelector(
  (state: IStore) => ({
    userSummaryAndIncentivesGroup: state.pools.userSummaryAndIncentivesGroup,
    poolGroups:  getPoolGroupsState.lastResult(),
  }),
  ({ poolGroups, userSummaryAndIncentivesGroup }) => {
    const summary = poolGroups
      .flatMap(({ pools }) => pools)
      .reduce(
        (acc, pool) => {
          const { borrowBalance, supplyBalance, userLiquidationThreshold } =
            getPoolSupplyAndBorrowBallance(
              pool,
              userSummaryAndIncentivesGroup || []
            );
          // check if the pool is already in the array
          const index = acc.findIndex(
            (p) => p.chainId === pool.chainId && p.provider === pool.provider
          );
          const totalSupplyUSD = Number(
            valueToBigNumber(supplyBalance).multipliedBy(pool.priceInUSD)
          );
          const totalBorrowsUSD = Number(
            valueToBigNumber(borrowBalance).multipliedBy(pool.priceInUSD)
          );
          const totalCollateralUSD = Number(
            valueToBigNumber(
              valueToBigNumber(supplyBalance).multipliedBy(
                Number(userLiquidationThreshold)
              )
            ).multipliedBy(pool.priceInUSD)
          );

          if (index > -1) {
            // if it is, update the totalBorrowsUSD
            acc[index].totalBorrowsUSD =
              Number(acc[index].totalBorrowsUSD) + totalBorrowsUSD;
            // update the totalCollateralUSD
            acc[index].totalCollateralUSD =
              Number(acc[index].totalCollateralUSD) + totalCollateralUSD;
            acc[index].totalSupplyUSD =
              Number(acc[index].totalSupplyUSD) + totalSupplyUSD;
          } else {
            // if it is not, add it to the array
            acc.push({
              chainId: pool.chainId,
              provider: pool.provider,
              totalSupplyUSD,
              totalCollateralUSD,
              totalBorrowsUSD,
              currentLiquidationThreshold: Number(userLiquidationThreshold),
            });
          }
          return acc;
        },
        [] as {
          chainId: number;
          provider: string;
          totalSupplyUSD: number;
          totalCollateralUSD: number;
          totalBorrowsUSD: number;
          currentLiquidationThreshold: number;
        }[]
      )
      .filter((g) => g.totalSupplyUSD > 0 || g.totalBorrowsUSD > 0);
    return summary;
  }
);


export const getErrorState = createSelector(getState, (state) => state.error);