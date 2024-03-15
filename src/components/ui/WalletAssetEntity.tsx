import { IAsset } from "@/interfaces/asset.interface";
import { currencyFormat } from "@/utils/currencyFormat";
import { getAssetIconUrl } from "@/utils/getAssetIconUrl";
import { numberFormat } from "@/utils/numberFormat";
import {
  IonAvatar,
  IonCol,
  IonGrid,
  IonLabel,
  IonRow,
  IonText,
} from "@ionic/react";
import { SelectedTokenDetail } from "../base/WalletBaseContainer";

export function WalletAssetEntity(props: {
  asset: SelectedTokenDetail;
  setSelectedTokenDetail: (asset: SelectedTokenDetail) => void;
}) {
  const { asset, setSelectedTokenDetail } = props;

  return (
    <IonGrid
      class="ion-no-padding"
      onClick={() => {
        setSelectedTokenDetail(asset);
      }}
      style={{
        cursor: "pointer",
        borderBottom: "solid 1px rgba(var(--ion-color-primary-rgb), 0.2)",
      }}
    >
      <IonRow className="ion-align-items-center ion-justify-content-between ion-padding-vertical">
        <IonCol
          size="auto"
          className="ion-align-self-start ion-padding-start"
          style={{ display: "flex" }}
        >
          <IonAvatar
            style={{
              overflow: "hidden",
              width: "56px",
              height: "56px",
            }}
          >
            <img
              src={getAssetIconUrl({
                symbol:
                  asset.name.toLowerCase().includes("aave") &&
                  asset.name.toLowerCase() !== "aave token"
                    ? asset.name.split(" ").pop() || asset.symbol
                    : asset.symbol,
              })}
              alt={asset.symbol}
              style={{ transform: "scale(1.01)" }}
              onError={(event) => {
                (
                  event.target as any
                ).src = `https://images.placeholders.dev/?width=42&height=42&text=${asset.symbol}&bgColor=%23000000&textColor=%23182449`;
              }}
            />
          </IonAvatar>
          <IonLabel className="ion-padding-start">
            <h2>{asset.symbol}</h2>
            <IonText color="medium">
              <p>{asset.name}</p>
            </IonText>
          </IonLabel>
        </IonCol>
        <IonCol
          size="6"
          className="ion-text-end ion-padding-end"
        >
          <IonGrid className="ion-no-padding">
            <IonRow className="ion-no-padding ion-text-end">
              <IonCol size="4" className="ion-padding ion-hide-md-down">
                <IonText color="dark">
                  <p className="ion-no-margin">{currencyFormat.format(asset.priceUsd)}</p>
                </IonText>
              </IonCol>
              <IonCol size="4" className="ion-padding ion-hide-md-down">
                <IonText color="dark">
                  <p className="ion-no-margin">{numberFormat.format(asset.balance)}</p>
                </IonText>
              </IonCol>
              <IonCol size="4" className="ion-padding">
                <IonText color="dark">
                  <p className="ion-no-margin">
                    <b>{currencyFormat.format(asset.balanceUsd)}</b>
                  </p>
                </IonText>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
}
