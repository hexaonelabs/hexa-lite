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
  return (value / max) * 100;
};

export const isAavePoolActive = ({
  poolReserveWSTETH,
  poolReserveWETH,
}: {
  poolReserveWSTETH?: (ReserveDataHumanized & FormatReserveUSDResponse),
  poolReserveWETH?: (ReserveDataHumanized & FormatReserveUSDResponse),
}) => {
  const isWSTETHActive = Number(!poolReserveWSTETH
    ? 100
    : getPercent(
        valueToBigNumber(poolReserveWSTETH.totalLiquidityUSD).toNumber(),
        valueToBigNumber(poolReserveWSTETH.supplyCapUSD).toNumber()
      )
  ) < 99;
  const isWETHActive = Number(!poolReserveWETH
    ? 100
    : getPercent(
        valueToBigNumber(poolReserveWETH.totalDebtUSD).toNumber(),
        valueToBigNumber(poolReserveWETH.borrowCapUSD).toNumber()
      )
  ) < 99;
  console.log({isWSTETHActive, isWETHActive, poolReserveWSTETH, poolReserveWETH });
  
  return (isWSTETHActive && isWETHActive) || false;
}