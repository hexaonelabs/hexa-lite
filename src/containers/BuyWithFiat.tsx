import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonTitle, IonToolbar } from "@ionic/react";
import { close } from "ionicons/icons";

export default function BuyWithFiat(props: {
  dismiss: ()=> void
}) {

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
          <IonContent className="ion-no-padding mobileConentModal" fullscreen={true}>
            <iframe
              allow="usb; ethereum; clipboard-write; payment; microphone; camera"
              loading="lazy"
              src="https://widget.mtpelerin.com/?_ctkn=57112584-7191-4d1b-8d90-28c7c800f3ea&type=web&tabs=buy&mode=dark&dnet=optimism_mainnet&bdc=ETH&net=optimism_mainnet&nets=optimism_mainnet&primary=%230090FF"
              title="Mt Pelerin exchange widget"
              style={{
                width: '100%', 
                height: '100%', 
                margin: '0', 
                padding: '0', 
                border: 'none',
                position: 'relative',
                bottom: '-1rem'
              }}
            ></iframe>
          </IonContent>
    </>
  )
}