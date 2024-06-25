import { CHAIN_AVAILABLES, CHAIN_DEFAULT } from "@/constants/chains";
import { getQrcodeAsSVG } from "@/servcies/qrcode.service";
import Store from "@/store";
import { getWeb3State } from "@/store/selectors";
import {
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonFooter,
  IonGrid,
  IonHeader,
  IonIcon,
  IonRow,
  IonText,
  IonTitle,
  IonToolbar,
  useIonModal,
} from "@ionic/react";
import { useEffect, useState } from "react";
import { close, copyOutline, scan } from 'ionicons/icons';
import { SuccessCopyAddress } from "@/components/SuccessCopyAddress";
import { useLoader } from "@/context/LoaderContext";
import { SelectNetwork } from "@/components/SelectNetwork";

export const DepositContainer = (props: {
  dismiss: ()=> Promise<void>;
  handleBuyWithFiat: (state: boolean)=> Promise<void>;
}) => {
  const {
    currentNetwork,
    walletAddress,
    switchNetwork,
  } = Store.useState(getWeb3State);
  const [qrCodeSVG, setQrCodeSVG] = useState<SVGElement | null>(null);
  const chain =
    CHAIN_AVAILABLES.find((chain) => chain.id === currentNetwork) ||
    CHAIN_DEFAULT;
  const [presentSuccessCopyAddress, dismissSuccessCopyAddress] = useIonModal(
    () => (
      <SuccessCopyAddress
        walletAddress={walletAddress || ""}
        chain={chain}
        dismiss={dismissSuccessCopyAddress}
      />
    )
  );
  const [presentSelectNetwork, dismissSelectNetwork] = useIonModal(() => (
    <SelectNetwork
      chains={CHAIN_AVAILABLES}
      isExternalWallet={false}
      dismiss={dismissSelectNetwork}
    />
  ));
  const { display: displayLoader, hide: hidLoader } = useLoader();

  const handleActions = async (type: string, payload?: string) => {
    await displayLoader();
    switch (true) {
      case type === "copy": {
        if (!payload) return;
        navigator?.clipboard?.writeText(payload);
        // display toast confirmation
        presentSuccessCopyAddress({
          cssClass: "modalAlert",
          onDidDismiss(event) {
            console.log("onDidDismiss", event.detail.role);
            if (!event.detail.role || event?.detail?.role === "cancel") return;
            handleActions(event.detail.role, payload);
          },
        });
        break;
      }
      case type === "selectNetwork": {
        presentSelectNetwork({
          cssClass: "modalAlert",
          onDidDismiss(event) {
            if (!event.detail.role || event?.detail?.role === "cancel") return;
            handleActions(event.detail.role, event.detail.data).then(() =>
              hidLoader()
            );
          },
        });
        break;
      }
      case type === "getAddressFromNetwork": {
        await switchNetwork(Number(payload));
        dismissSelectNetwork(null, "cancel");
        await handleActions("copy", `${walletAddress}`);
        break;
      }
      case type === 'buy': {
        props.handleBuyWithFiat(true);
      }
      default:
        break;
    }
    await hidLoader();
  };

  useEffect(() => {
    if (!walletAddress) {
      return;
    }
    getQrcodeAsSVG(walletAddress).then((url) => {
      // convet string to SVG
      const svg = new DOMParser().parseFromString(
        url as string,
        "image/svg+xml"
      );
      console.log(svg.documentElement);
      setQrCodeSVG(svg.documentElement as unknown as SVGElement);
    });
  }, [walletAddress]);

  return (
    <>
      <IonHeader className="ion-no-border" translucent={true}>
        <IonToolbar style={{'--background': 'transparent'}}>
          <IonTitle>
            Deposit
          </IonTitle>
          <IonButtons slot="end">
            <IonButton 
              fill="clear" 
              size="small"
              onClick={() => {
                props.dismiss();
              }}>
              <IonIcon icon={close} size="small" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="mobileConentModal">
            <IonText color="medium">
                <p 
                  className="ion-text-center">
                  Wallet Address<br/>
                  <IonText color="primary">
                    <small onClick={() => handleActions("copy", walletAddress || "")} style={{ cursor: "pointer" }}>
                      {walletAddress?.slice(0, 6)}...{walletAddress?.slice(walletAddress.length - 6, walletAddress.length)}
                      <IonIcon
                        icon={copyOutline}
                        style={{ fontSize: '0.65rem', marginLeft: '0.25rem' }} />
                    </small>

                  </IonText>
                </p>
              </IonText>
        <IonGrid className="ion-margin-bottom ion-padding-bottom">
          <IonRow className="ion-text-center ion-padding">
            <IonCol size="12" className="ion-padding">

              <div
                className="qrCodeContainer ion-margin"
                style={{
                  border: 'solid 2px var(--ion-color-primary)',
                  borderRadius: "32px",
                  overflow: "hidden",
                  transform: "scale(1.1)",
                  maxWidth: '250px',
                  margin: 'auto',
                }}
                dangerouslySetInnerHTML={{ __html: qrCodeSVG?.outerHTML || "" }}
              />
              <IonGrid>
                <IonRow className="ion-text-center ion-align-items-center ion-justify-content-center">
                  <IonCol size="12">
                    <IonText>
                      <p className="ion-margin-top">
                        <small>
                          You can send token to all this following networks that
                          are available to this address
                        </small>
                      </p>
                    </IonText>
                  </IonCol>
                  {CHAIN_AVAILABLES.filter((c) => c.type === "evm").map(
                    (chain, index) => (
                      <IonCol size="auto" key={index}>
                        <img
                          src={chain.logo}
                          alt={chain.name}
                          style={{ width: "24px" }}
                        />
                      </IonCol>
                    )
                  )}
                </IonRow>
              </IonGrid>
            </IonCol>
          </IonRow>
          {/* <IonRow className="ion-margin-vertical ion-padding-vertical">
            <IonCol size="12" className="ion-padding ion-margin-bottom">
              <IonButton expand="block" fill="clear">
                <IonIcon slot="start" icon={scan} />
                Scan QR Code
              </IonButton>
            </IonCol>
          </IonRow> */}
        </IonGrid>
      </IonContent>
      <IonFooter>
        <IonToolbar style={{'--background': 'transparent'}}>
          <IonButton 
            fill="outline" 
            color="primary" 
            expand="block"
            onClick={()=> {
              handleActions('buy');
            }}>
            Buy Crypto
          </IonButton>
        </IonToolbar>
      </IonFooter>
    </>
  );
};
