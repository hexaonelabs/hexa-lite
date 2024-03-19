import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonTitle, IonToolbar } from "@ionic/react";
import { close } from "ionicons/icons";

export const BuyWithFiat = (props: {
  dismiss: ()=> void
}) => {

  return (
    <>
    <IonHeader className="ion-no-border" translucent={true}>
            <IonToolbar style={{ "--background": "transparent" }}>
              <IonTitle>
                <h1>Buy</h1>
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
              allow="usb; ethereum; clipboard-write; payment; microphone; camera"
              loading="lazy"
              src="https://widget.mtpelerin.com/?_ctkn=954139b2-ef3e-4914-82ea-33192d3f43d3&type=web&tabs=buy&mode=dark&dnet=optimism_mainnet&bdc=ETH&net=optimism_mainnet&nets=optimism_mainnet&primary=%230090FF"
              title="Mt Pelerin exchange widget"
              style={{width: '100%', height: '100%'}}
            ></iframe>
          </IonContent>
    </>
  )
}