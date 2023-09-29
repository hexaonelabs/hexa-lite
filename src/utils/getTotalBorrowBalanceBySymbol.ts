import { IUserSummary } from "../interfaces/reserve.interface";

export const getTotalBorrowBalanceBySymbol = (
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
        const value = Number(cur.totalBorrows);
        return acc + value;
      }, 0) || 0
  );
};
