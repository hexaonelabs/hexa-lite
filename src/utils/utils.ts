import { ReserveDataHumanized } from "@aave/contract-helpers";
import { FormatReserveUSDResponse, valueToBigNumber } from "@aave/math-utils";

export const roundToTokenDecimals = (inputValue: string, tokenDecimals: number) => {
  const [whole, decimals] = inputValue.split('.');

  // If there are no decimal places or the number of decimal places is within the limit
  if (!decimals || decimals.length <= tokenDecimals) {
    return inputValue;
  }

  // Truncate the decimals to the specified number of token decimals
  const adjustedDecimals = decimals.slice(0, tokenDecimals);

  // Combine the whole and adjusted decimal parts
  return whole + '.' + adjustedDecimals;
};

export const getPercent = (value: number, max: number): number => {
  const result = (value / max) * 100;
  return isNaN(result) ? 100 : result;
};

export const isAavePoolDisabled = ({
  poolReserveWSTETH,
  poolReserveWETH,
}: {
  poolReserveWSTETH?: (ReserveDataHumanized & FormatReserveUSDResponse),
  poolReserveWETH?: (ReserveDataHumanized & FormatReserveUSDResponse),
}) => {
  const isWSTETHDisabled = Number(!poolReserveWSTETH
    ? 0
    : getPercent(
        valueToBigNumber(poolReserveWSTETH.totalLiquidityUSD).toNumber(),
        valueToBigNumber(poolReserveWSTETH.supplyCapUSD).toNumber()
      )
  ) >= 99;
  const isWETHDisabled = Number(!poolReserveWETH
    ? 0
    : getPercent(
        valueToBigNumber(poolReserveWETH.totalDebtUSD).toNumber(),
        valueToBigNumber(poolReserveWETH.borrowCapUSD).toNumber()
      )
  ) >= 99;
  // console.log({isWSTETHDisabled, isWETHDisabled, poolReserveWSTETH, poolReserveWETH });
  
  return (isWSTETHDisabled || isWETHDisabled) || false;
}