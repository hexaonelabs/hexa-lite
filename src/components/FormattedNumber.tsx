import { normalizeBN, valueToBigNumber } from '@aave/math-utils';

interface CompactNumberProps {
  value: string | number;
  visibleDecimals?: number;
  roundDown?: boolean;
  compactThreshold?: number;
}

const POSTFIXES = ['', 'K', 'M', 'B', 'T', 'P', 'E', 'Z', 'Y'];

function CompactNumber({
  value,
  visibleDecimals = 2,
  roundDown,
  compactThreshold,
}: CompactNumberProps) {
  const bnValue = valueToBigNumber(value);

  let integerPlaces = bnValue.toFixed(0).length;
  if (compactThreshold && Number(value) <= compactThreshold) {
    integerPlaces = 0;
  }
  const significantDigitsGroup = Math.min(
    Math.floor(integerPlaces ? (integerPlaces - 1) / 3 : 0),
    POSTFIXES.length - 1
  );
  const postfix = POSTFIXES[significantDigitsGroup];
  let formattedValue = normalizeBN(bnValue, 3 * significantDigitsGroup).toNumber();
  if (roundDown) {
    // Truncates decimals after the visible decimal point, i.e. 10.237 with 2 decimals becomes 10.23
    formattedValue =
      Math.trunc(Number(formattedValue) * 10 ** visibleDecimals) / 10 ** visibleDecimals;
  }
  const prefix = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: visibleDecimals,
    minimumFractionDigits: visibleDecimals,
  }).format(formattedValue);

  return (
    <>
      {prefix}
      {postfix}
    </>
  );
}

export interface FormattedNumberProps {
  value: string | number;
  symbol?: string;
  visibleDecimals?: number;
  compact?: boolean;
  percent?: boolean;
  symbolsColor?: string;
  symbolsVariant?: any;
  roundDown?: boolean;
  compactThreshold?: number;
}

export function FormattedNumber({
  value,
  symbol,
  visibleDecimals,
  compact,
  percent,
  symbolsVariant,
  symbolsColor,
  roundDown,
  compactThreshold,
  ...rest
}: FormattedNumberProps) {
  const number = percent ? Number(value) * 100 : Number(value);

  let decimals: number = visibleDecimals ?? 0;
  if (number === 0) {
    decimals = 0;
  } else if (visibleDecimals === undefined) {
    if (number > 1 || percent || symbol === 'USD') {
      decimals = 2;
    } else {
      decimals = 7;
    }
  }

  const minValue = 10 ** -(decimals as number);
  const isSmallerThanMin = number !== 0 && Math.abs(number) < Math.abs(minValue);
  let formattedNumber = isSmallerThanMin ? minValue : number;
  const forceCompact = compact !== false && (compact || number > 99_999);

  // rounding occurs inside of CompactNumber as the prefix, not base number is rounded
  if (roundDown && !forceCompact) {
    formattedNumber = Math.trunc(Number(formattedNumber) * 10 ** decimals) / 10 ** decimals;
  }

  return (
    <div>
      {isSmallerThanMin && ('<')}
      {symbol?.toLowerCase() === 'usd' && !percent && ('$')}
      {!forceCompact ? (
        new Intl.NumberFormat('en-US', {
          maximumFractionDigits: decimals,
          minimumFractionDigits: decimals,
        }).format(formattedNumber)
      ) : (
        <CompactNumber
          value={formattedNumber}
          visibleDecimals={decimals}
          roundDown={roundDown}
          compactThreshold={compactThreshold}
        />
      )}

      {percent && ('%')}
      
      {symbol}
      
      {/* {symbol?.toLowerCase() !== 'usd' && typeof symbol !== 'undefined' && ({symbol})} */}
    </div>
  );
}