import { IonAvatar, IonIcon, IonImg } from "@ionic/react";
import { CHAIN_AVAILABLES } from "../constants/chains";
import { getAssetIconUrl } from "../utils/getAssetIconUrl";

export function SymbolIcon(props: {symbol: string; chainId?: number; iconSize?: string; id?: string}) {
  const { symbol, chainId, iconSize = '48px' } = props;
  const chainIdIcon = chainId ? (
    <IonIcon
      style={{
        fontSize: `calc(${iconSize} / 3)`,
        transform: "translateX(-0.2rem)",
        position: "absolute",
        bottom: "0rem",
      }}
      src={CHAIN_AVAILABLES.find((c) => c.id === chainId)?.logo}
    ></IonIcon>
  ) : null;
  return (
    <div
      style={{ minWidth: iconSize, position: "relative" }}
    >
      <IonAvatar
        style={{
          height: iconSize,
          width: iconSize,
          minHeight: iconSize,
          minWidth: iconSize,
        }}
      >
        <IonImg src={getAssetIconUrl({ symbol })}></IonImg>
      </IonAvatar>
      {chainIdIcon}
    </div>
  );
}
