import { IAsset } from "@/interfaces/asset.interface";
import { IUserSummary } from "@/interfaces/reserve.interface";
import { MarketPool } from "@/pool/Market.pool";

export const getPoolWalletBalance = (pool: MarketPool, assets: IAsset[]) => assets.find(
  (a) => a.symbol === pool.symbol && a.chain?.id === pool.chainId && a.contractAddress === pool.underlyingAsset
)?.balance || 0;

export const getPoolSupplyAndBorrowBallance = (pool: MarketPool, userSummaryAndIncentivesGroup: IUserSummary[]) => {
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
  const poolLiquidationThreshold =  Number(userReserve?.reserve?.formattedReserveLiquidationThreshold||-1);
  // get `userLiquidationThreshold` from `userSummaryAndIncentivesGroup` Object
  const {currentLiquidationThreshold: userLiquidationThreshold = -1} = userSummaryAndIncentivesGroup.find(
    (userSummary) => userSummary.chainId === pool.chainId
  )||{};
  return { supplyBalance, borrowBalance, poolLiquidationThreshold, userLiquidationThreshold};
}