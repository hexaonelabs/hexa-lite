import Store from "@/store";
import { getWeb3State } from "@/store/selectors";
import {
  IonAvatar,
  IonCol,
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonRow,
  IonText,
} from "@ionic/react";
import { SelectedTokenDetail } from "../base/WalletBaseContainer";
import { getAssetIconUrl } from "@/utils/getAssetIconUrl";
import { currencyFormat } from "@/utils/currencyFormat";
import { paperPlane, repeat } from "ionicons/icons";

export const WalletAssetsList = (props: {
  totalBalance: number;
  assetGroup: SelectedTokenDetail[];
  filterBy: string;
  handleTokenDetailClick: (asset: SelectedTokenDetail) => Promise<void>;
  handleTransferClick: (asset: SelectedTokenDetail) => Promise<void>;
  setIsSwapModalOpen: (asset: SelectedTokenDetail) => Promise<void>;
}) => {
  const { 
    totalBalance, assetGroup, filterBy, 
    handleTokenDetailClick, handleTransferClick, setIsSwapModalOpen 
  } = props;

  return (
    <>
      {totalBalance > 0 && (
        <IonRow
          className="ion-no-padding"
          style={{ maxWidth: "950px", margin: "auto" }}
        >
          <IonCol size="12" className="ion-no-padding">
            <IonList
              style={{ background: "transparent" }}
              className="ion-no-padding"
            >
              {assetGroup
                .filter((asset) =>
                  filterBy
                    ? asset.symbol
                        .toLowerCase()
                        .includes(filterBy.toLowerCase())
                    : true
                )
                .sort((a, b) => (a.balanceUsd > b.balanceUsd ? -1 : 1))
                .map((asset, index) => (
                  <IonItemSliding key={index}>
                    <IonItem
                      style={{
                        "--background": "var(--ion-background-color)",
                      }}
                      onClick={() => {
                        console.log("handleTokenDetailClick: ", asset);
                        handleTokenDetailClick(asset);
                      }}
                    >
                      <IonAvatar
                        slot="start"
                        style={{
                          overflow: "hidden",
                          width: "42px",
                          height: "42px",
                        }}
                      >
                        <img
                          src={
                            asset.symbol === "ETH"
                              ? getAssetIconUrl({
                                  symbol: asset.symbol,
                                })
                              : asset.thumbnail ||
                                getAssetIconUrl({
                                  symbol: asset.symbol,
                                })
                          }
                          alt={asset.symbol}
                          style={{ transform: "scale(1.01)" }}
                          onError={(event) => {
                            (
                              event.target as any
                            ).src = `https://images.placeholders.dev/?width=42&height=42&text=${asset.symbol}&bgColor=%23000000&textColor=%23182449`;
                          }}
                        />
                      </IonAvatar>
                      <IonLabel className="">
                        <IonText>
                          <h2 className="ion-no-margin">{asset.symbol}</h2>
                        </IonText>
                        <IonText color="medium">
                          <p className="ion-no-margin">
                            <small>{asset.name}</small>
                          </p>
                        </IonText>
                      </IonLabel>
                      <IonText slot="end" className="ion-text-end">
                        <p>
                          {currencyFormat.format(asset.balanceUsd)}
                          <br />
                          <IonText color="medium">
                            <small>{asset.balance.toFixed(6)}</small>
                          </IonText>
                        </p>
                      </IonText>
                    </IonItem>
                    <IonItemOptions
                      side="end"
                      onClick={(event) => {
                        // close the sliding item after clicking the option
                        (event.target as HTMLElement)
                          .closest("ion-item-sliding")
                          ?.close();
                      }}
                    >
                      <IonItemOption
                        color="primary"
                        onClick={() => {
                          handleTransferClick(asset);
                        }}
                      >
                        <IonIcon
                          slot="icon-only"
                          size="small"
                          icon={paperPlane}
                        ></IonIcon>
                      </IonItemOption>
                      <IonItemOption
                        color="primary"
                        onClick={() => {
                          setIsSwapModalOpen(asset);
                        }}
                      >
                        <IonIcon
                          slot="icon-only"
                          size="small"
                          icon={repeat}
                        ></IonIcon>
                      </IonItemOption>
                    </IonItemOptions>
                  </IonItemSliding>
                ))}
            </IonList>
          </IonCol>
        </IonRow>
      )}
    </>
  );
};
