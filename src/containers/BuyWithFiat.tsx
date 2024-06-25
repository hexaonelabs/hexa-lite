import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { close } from "ionicons/icons";

export default function BuyWithFiat(props: {
  isLightmode?: boolean;
  dismiss: () => void;
}) {
  const url = `https://widget.mtpelerin.com/?_ctkn=57112584-7191-4d1b-8d90-28c7c800f3ea&type=web&tabs=buy${
    props.isLightmode ? "" : "&mode=dark"
  }&dnet=optimism_mainnet&bdc=ETH&net=optimism_mainnet&nets=optimism_mainnet&primary=%230090FF`;
  console.log(props?.isLightmode)
  return (
    <>
      <IonHeader className="ion-no-border" translucent={true}>
        <IonToolbar style={{ "--background": "transparent" }}>
          <IonTitle>
            Buy
          </IonTitle>
          <IonButtons slot="end">
            <IonButton
              fill="clear"
              size="small"
              onClick={() => {
                props.dismiss();
              }}
            >
              <IonIcon icon={close} size="small" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-no-padding mobileConentModal">
        <iframe
          id="onramp__frame"
          allow="usb; ethereum; clipboard-write; payment; microphone; camera"
          loading="lazy"
          src={url}
          title="Mt Pelerin exchange widget"
        ></iframe>
      </IonContent>
    </>
  );
}
