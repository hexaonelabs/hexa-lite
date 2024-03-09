import { CHAIN_AVAILABLES } from "@/constants/chains";
import { getQrcodeAsSVG } from "@/servcies/qrcode.service";
import Store from "@/store";
import { getWeb3State } from "@/store/selectors";
import {
  IonButton,
  IonCol,
  IonContent,
  IonFooter,
  IonGrid,
  IonHeader,
  IonIcon,
  IonRow,
  IonText,
  IonToolbar,
} from "@ionic/react";
import { useEffect, useState } from "react";
import { scan } from 'ionicons/icons';

export const MobileDepositModal = () => {
  const {
    web3Provider,
    currentNetwork,
    walletAddress,
    connectWallet,
    disconnectWallet,
    switchNetwork,
  } = Store.useState(getWeb3State);
  const [qrCodeSVG, setQrCodeSVG] = useState<SVGElement | null>(null);

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
          <IonGrid>
            <IonRow className="ion-text-center">
              <IonCol size="12">
                <IonText>
                  <h1>Deposit</h1>
                </IonText>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonToolbar>
      </IonHeader>
      <IonContent className="mobileConentModal">
            <IonText color="medium">
                <p className="ion-text-center">
                  <small>
                    {walletAddress}
                  </small>
                </p>
              </IonText>
        <IonGrid className="ion-margin-bottom ion-padding-bottom">
          <IonRow className="ion-text-center ion-padding">
            <IonCol size="12" className="ion-padding">

              <div
                className="ion-margin"
                style={{
                  borderRadius: "32px",
                  overflow: "hidden",
                  transform: "scale(1.1)",
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
    </>
  );
};
