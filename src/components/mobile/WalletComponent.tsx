import Store from "@/store";
import { getWeb3State } from "@/store/selectors";
import { getReadableValue } from "@/utils/getReadableValue";
import {
  IonAvatar,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCol,
  IonContent,
  IonFab,
  IonFabButton,
  IonGrid,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonModal,
  IonPage,
  IonRow,
  IonSearchbar,
  IonText,
  IonTitle,
  IonToolbar,
  ModalOptions,
  useIonAlert,
  useIonModal,
  useIonRouter,
} from "@ionic/react";
import { paperPlane, download, repeat, card } from "ionicons/icons";
import { useMemo, useState } from "react";
import styleRule from "./WalletComponent.module.css";
import { IAsset } from "@/interfaces/asset.interface";
import { MobileDepositModal } from "./MobileDepositModal";
import { HookOverlayOptions } from "@ionic/react/dist/types/hooks/HookOverlayOptions";
import { MobileTransferModal } from "./MobileTransferModal";
import { getMagic } from "@/servcies/magic";
import { MobileSwapModal } from "./MobileSwapModal";
import { MobileTokenDetailModal } from "./MobileTokenDetailModal";
import { getAssetIconUrl } from "@/utils/getAssetIconUrl";
import { MobileActionNavButtons } from "./ActionNavButtons";

export default function WalletComponent() {
  const { walletAddress, isMagicWallet, assets } = Store.useState(getWeb3State);
  const [presentAlert, dismissAlert] = useIonAlert();
  const [filterBy, setFilterBy] = useState<string | null>(null);
  const [selectedTokenDetail, setSelectedTokenDetail] = useState<{
    name: string;
    symbol: string;
    priceUsd: number;
    balance: number;
    balanceUsd: number;
    thumbnail: string;
    assets: IAsset[];
  } | null>(null);

  const [presentTransfer] = useIonModal(MobileTransferModal, {
    ...selectedTokenDetail,
  });
  const [presentDeposit] = useIonModal(MobileDepositModal, {
    ...selectedTokenDetail,
  });
  const [presentSwap] = useIonModal(MobileSwapModal, {
    ...selectedTokenDetail,
  });
  const [presentTokenDetail, dismissTokenDetail] = useIonModal(
    MobileTokenDetailModal,
    { data: selectedTokenDetail, dismiss: () => {
      dismissTokenDetail();
      setSelectedTokenDetail(null);
    }}
  );

  const modalOpts: Omit<ModalOptions, "component" | "componentProps"> &
    HookOverlayOptions = {
    initialBreakpoint: 0.98,
    breakpoints: [0, 0.98],
  };
  // const assets: any[] = [];
  const router = useIonRouter();
  const balance = useMemo(() => {
    if (!assets) {
      return 0;
    }
    return assets.reduce((acc, asset) => {
      return acc + asset.balanceUsd;
    }, 0);
  }, [assets]);

  const assetGroup = useMemo(
    () =>
      assets.reduce((acc, asset) => {
        // check existing asset symbol
        const index = acc.findIndex((a) => a.symbol === asset.symbol);
        if (index !== -1) {
          acc[index].balance += asset.balance;
          acc[index].balanceUsd += asset.balanceUsd;
          acc[index].assets.push(asset);
        } else {
          acc.push({
            name: asset.name,
            symbol: asset.symbol,
            priceUsd: asset.priceUsd,
            thumbnail: asset.thumbnail,
            balance: asset.balance,
            balanceUsd: asset.balanceUsd,
            assets: [asset],
          });
        }
        return acc;
      }, [] as { name: string; symbol: string; priceUsd: number; balance: number; balanceUsd: number; thumbnail: string; assets: IAsset[] }[]),
    [assets]
  );

  return (
    <IonPage>
      <IonHeader translucent={true}>
        <IonToolbar
          style={{
            "--background": "transparent",
            minHeight: "85px",
            display: "flex",
          }}
        >
          <IonTitle style={{ fontSize: "1.8rem", padding: "0" }}>
            Wallet
            <small
              style={{
                display: "block",
                fontSize: "0.8rem",
                fontWeight: "normal",
              }}
            >
              $ {balance.toFixed(2)}
            </small>
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent
        fullscreen={true}
        className="ion-no-padding"
        style={{ "--padding-top": "0px" }}
      >
        <IonHeader collapse="condense">
          <IonToolbar style={{ "--background": "transparent" }}>
            <IonGrid style={{ margin: "10vh auto 0", maxWidth: "450px" }}>
              <IonRow className="ion-align-items-center ion-text-center">
                <IonCol>
                  <div>
                    <IonText>
                      <h1 style={{ fontSize: "2.618rem" }}>Wallet</h1>
                      <p
                        style={{
                          fontSize: "1.625rem",
                          margin: "0px 0px 1.5rem",
                        }}
                      >
                        $ {getReadableValue(balance)}
                      </p>
                    </IonText>
                  </div>
                </IonCol>
              </IonRow>

              <MobileActionNavButtons selectedTokenDetail={selectedTokenDetail} />

              {assetGroup.length > 0 && (
                <IonRow className="ion-padding-top ion-padding-horizontal">
                  <IonCol size="12">
                    <div>
                      <IonSearchbar
                        debounce={500}
                        onIonInput={(event) => {
                          console.log(event);
                          setFilterBy(event.detail.value || null);
                        }}
                      ></IonSearchbar>
                    </div>
                  </IonCol>
                </IonRow>
              )}
            </IonGrid>
          </IonToolbar>
        </IonHeader>

        <IonGrid
          className="ion-no-padding"
          style={{
            "background": "var(--ion-background-color)",
            minHeight: '100%'
          }}
        >
          {balance <= 0 && (
            <IonRow className="ion-padding-vertical">
              <IonCol size="12">
                <IonCard
                  onClick={async () => {
                    if (
                      walletAddress &&
                      walletAddress !== "" &&
                      isMagicWallet
                    ) {
                      const magic = await getMagic();
                      magic.wallet.showOnRamp();
                    } else {
                      await presentAlert({
                        header: "Information",
                        message:
                          "Connect with e-mail or social login to enable buy crypto with fiat.",
                        buttons: ["OK"],
                        cssClass: "modalAlert",
                      });
                    }
                  }}
                >
                  <IonCardContent>
                    <IonGrid>
                      <IonRow className="ion-align-items-center">
                        <IonCol size="auto" className="ion-padding-end">
                          <IonIcon icon={card} color="dark" />
                        </IonCol>
                        <IonCol>
                          <IonText color="dark">
                            <h2>Buy crypto</h2>
                            <p>
                              You have to get ETH to use your wallet. Buy with
                              credit card or with Apple Pay
                            </p>
                          </IonText>
                        </IonCol>
                      </IonRow>
                    </IonGrid>
                  </IonCardContent>
                </IonCard>

                <IonCard
                  className="ion-margin-top"
                  onClick={() => presentDeposit(modalOpts)}
                >
                  <IonCardContent>
                    <IonGrid>
                      <IonRow className="ion-align-items-center">
                        <IonCol size="auto" className="ion-padding-end">
                          <IonIcon icon={download} color="dark" />
                        </IonCol>
                        <IonCol>
                          <IonText color="dark">
                            <h2>Deposit assets</h2>
                            <p>
                              You have to get ETH to use your wallet. Buy with
                              credit card or with Apple Pay
                            </p>
                          </IonText>
                        </IonCol>
                      </IonRow>
                    </IonGrid>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          )}

          {balance > 0 && (
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
                            setSelectedTokenDetail(() => asset);
                            presentTokenDetail({
                              ...modalOpts,
                              onDidDismiss: () => setSelectedTokenDetail(null),
                            });
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
                              src={getAssetIconUrl({
                                symbol: asset.symbol,
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
                              $ {asset.balanceUsd.toFixed(2)}
                              <br />
                              <IonText color="medium">
                                <small>{asset.balance.toFixed(6)}</small>
                              </IonText>
                            </p>
                          </IonText>
                        </IonItem>
                        <IonItemOptions side="end">
                          <IonItemOption
                            color="primary"
                            onClick={() => {
                              setSelectedTokenDetail(() => asset);
                              presentTransfer({
                                ...modalOpts,
                                onDidDismiss: () =>
                                  setSelectedTokenDetail(null),
                              });
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
                              setSelectedTokenDetail(() => asset);
                              presentSwap({
                                ...modalOpts,
                                onDidDismiss: () =>
                                  setSelectedTokenDetail(null),
                              });
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
        </IonGrid>
      </IonContent>
    </IonPage>
  );
}
