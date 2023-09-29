import { IUserSummary } from "../interfaces/reserve.interface";

export const getTotalSupplyBalanceBySymbol = (
  userSummaryAndIncentivesGroup: IUserSummary[],
  symbol: string
): number => {
  return (
    userSummaryAndIncentivesGroup
      .map((s) =>
        s.userReservesData?.filter(({ reserve }) => reserve.symbol === symbol)
      )
      .flat()
      .reduce((acc, cur) => {
        const value = Number(cur.underlyingBalance);
        return acc + value;
      }, 0) || 0
  );
};
