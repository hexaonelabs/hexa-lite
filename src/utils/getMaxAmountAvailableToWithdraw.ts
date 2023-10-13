import { ReserveDataHumanized } from "@aave/contract-helpers";
import { FormatUserSummaryAndIncentivesResponse, formatReservesAndIncentives, valueToBigNumber } from "@aave/math-utils";
import BigNumber from "bignumber.js";



export const getMaxAmountAvailableToWithdraw = (
  userReserve: {
    underlyingBalance: string;
    usageAsCollateralEnabledOnUser: boolean;
  },
  poolReserve: {
    reserveLiquidationThreshold: string;
    formattedEModeLiquidationThreshold: string;
    formattedReserveLiquidationThreshold: string;
    formattedPriceInMarketReferenceCurrency: string;
    unborrowedLiquidity: string;
    eModeCategoryId: number;
  },
  user: {
    isInEmode: boolean;
    userEmodeCategoryId: number;
    healthFactor: string;
    totalBorrowsMarketReferenceCurrency: string;
  }) => {

  // calculations
  const underlyingBalance = valueToBigNumber(userReserve?.underlyingBalance || '0');
  const unborrowedLiquidity = valueToBigNumber(poolReserve.unborrowedLiquidity);
  let maxAmountToWithdraw = BigNumber.min(underlyingBalance, unborrowedLiquidity);
  let maxCollateralToWithdrawInETH = valueToBigNumber('0');
  const reserveLiquidationThreshold =
    user.isInEmode && user.userEmodeCategoryId === poolReserve.eModeCategoryId
      ? poolReserve.formattedEModeLiquidationThreshold
      : poolReserve.formattedReserveLiquidationThreshold;
  if (
    userReserve?.usageAsCollateralEnabledOnUser &&
    poolReserve.reserveLiquidationThreshold !== '0' &&
    user.totalBorrowsMarketReferenceCurrency !== '0'
  ) {
    
    // if we have any borrowings we should check how much we can withdraw to a minimum HF of 1.01
    const excessHF = valueToBigNumber(user.healthFactor).minus('1.01');
    // console.log('XXX', {a: excessHF.gt('0'), b: user.healthFactor, c: maxAmountToWithdraw.toString(10)});
    if (excessHF.gt('0')) {
      maxCollateralToWithdrawInETH = excessHF
        .multipliedBy(user.totalBorrowsMarketReferenceCurrency)
        .div(reserveLiquidationThreshold);
    }
    maxAmountToWithdraw = BigNumber.min(
      maxAmountToWithdraw,
      maxCollateralToWithdrawInETH.dividedBy(poolReserve.formattedPriceInMarketReferenceCurrency)
    );
  }
  return maxAmountToWithdraw.toString(10) 
}