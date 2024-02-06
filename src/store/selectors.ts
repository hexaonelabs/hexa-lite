import { createSelector } from "reselect";
import { IStore } from ".";
import { valueToBigNumber } from "@aave/math-utils";
import { getPoolSupplyAndBorrowBallance } from "@/utils/getPoolWalletBalance";

const getState = (state: IStore) => state;

export const getWeb3State = createSelector(getState, (state) => state.web3);
export const getPoolsState = createSelector(getState, (state) => state.pools);

// Web3 Selectors
export const walletAddressState = createSelector(
  getWeb3State,
  (state) => state.walletAddress
);
export const connectWalletState = createSelector(
  getWeb3State,
  (state) => state.connectWallet
);

// Pools Selectors
export const poolGroupsState = createSelector(
  getPoolsState,
  (state) => state.poolGroups
);
export const totalTVLState = createSelector(
  getPoolsState,
  (state) => state.totalTVL
);
export const getProtocolSummaryState = createSelector(
  getPoolsState,
  ({ poolGroups, userSummaryAndIncentivesGroup }) => {
    const summary = poolGroups
      .flatMap(({ pools }) => pools)
      .reduce(
        (acc, pool) => {
          const {
            borrowBalance,
            supplyBalance,
            userLiquidationThreshold,
          } = getPoolSupplyAndBorrowBallance(
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
              valueToBigNumber(supplyBalance).multipliedBy(Number(userLiquidationThreshold))
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
