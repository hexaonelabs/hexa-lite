import { IonCol, IonContent, IonGrid, IonImg, IonRow, IonText, useIonRouter } from "@ionic/react";
import { IonPage,  } from '@ionic/react';
import ConnectButton from "../ConnectButton";

export default function MobileWelcomeComponent() {
  const router = useIonRouter();
  return (
    <IonPage>
    <IonContent>
      <IonGrid style={{ height: "100%" }}>
        <IonRow
          style={{ height: "100%" }}
          className="ion-text-center ion-justify-content-center ion-align-items-center"
        >
          <IonCol>
            <IonImg
              style={{
                width: "200px",
                height: "200px",
                margin: "auto",
              }}
              src={"./assets/images/logo.svg"}
            ></IonImg>

            <IonText>
              <h1 className="homeTitle">Hexa Lite</h1>
              <p className="slogan">
                Build your wealth with cryptoassets
              </p>
            </IonText>
            <ConnectButton />
          </IonCol>
        </IonRow>
      </IonGrid>
    </IonContent>
  </IonPage>
  );
}