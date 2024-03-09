import { IAsset } from "@/interfaces/asset.interface";
import { getAssetIconUrl } from "@/utils/getAssetIconUrl";
import { IonAvatar, IonCol, IonContent, IonGrid, IonRow, IonText } from "@ionic/react"

export const MobileTokenDetailModal = (props: { 
  name: string; symbol: string; priceUsd: number; balance: number; balanceUsd: number; thumbnail: string; assets: IAsset[];
 })=> {
  return (
    <IonContent className="mobileConentModal">
      <IonGrid>
        <IonRow className="ion-text-center">
          <IonCol size="12" className="ion-margin-top ion-padding-top">
            <IonAvatar
              style={{
                margin: 'auto',
                overflow: "hidden",
                width: "112px",
                height: "112px",
              }}
            >
              <img
                src={getAssetIconUrl({
                  symbol: props.symbol,
                })}
                alt={props.symbol}
                style={{ transform: "scale(1.01)" }}
                onError={(event) => {
                  (
                    event.target as any
                  ).src = `https://images.placeholders.dev/?width=42&height=42&text=${props.symbol}&bgColor=%23000000&textColor=%23182449`;
                }}
              />
            </IonAvatar>
            <IonText>
              <h1>{props.symbol}</h1>
            </IonText>
            <IonText color="medium">
              <p className="ion-no-margin">{props.name}</p>
            </IonText>
          </IonCol>
          <IonCol size="12">
            <IonText>
              <h2>$ {props.balanceUsd.toFixed(2)}</h2>
              <p>{props.balance.toFixed(6)}</p>
            </IonText>
          </IonCol>
        </IonRow>
      </IonGrid>
    </IonContent>
  );
}