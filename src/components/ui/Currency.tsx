import Store from "@/store";
import { getAppSettings } from "@/store/selectors";
import { currencyFormat } from "@/utils/currencyFormat";

export const Currency = (props: {
  value: number,
}) => {
  const { value } = props;
  const { ui: {hideCurrencieAmount} } = Store.useState(getAppSettings)

  const data = hideCurrencieAmount
    ? '*****'
    : currencyFormat.format(value)
  return (<>
    {data}
  </>)
} 