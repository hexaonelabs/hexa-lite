import { CHAIN_AVAILABLES } from "../constants/chains";
import { IAsset } from "../context/UserContext";
import { IUserSummary } from "../interfaces/reserve.interface";

export const getAssetFromAllNetwork = ({
  symbol,
  assets,
  userSummaryAndIncentivesGroup,
}: {
  symbol: string;
  assets?: IAsset[]|null;
  userSummaryAndIncentivesGroup?: IUserSummary[]|null;
}) =>  {
  return assets?.filter(
    a => a.symbol === symbol 
    && CHAIN_AVAILABLES.find((c) => c.id === a.chain?.id)
    && userSummaryAndIncentivesGroup?.find(
      s => s.chainId === a.chain?.id 
      && s.userReservesData.find(
        r => r.reserve.symbol === symbol
      )
    )
  )||[];
}