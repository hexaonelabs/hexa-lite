import web3Connector from "@/servcies/firebase-web3-connect";
import { FirebaseWeb3Connect } from "@hexaonelabs/firebase-web3connect";
import { IonContent, IonPage, useIonAlert, useIonLoading } from "@ionic/react";
import { useEffect } from "react";

export default function AuthWithLinkContainer() {
  const [presentLoader, dismissLoader] = useIonLoading();
  const [presentAlert] = useIonAlert();

  useEffect(() => {
    const connectFromEmailLink = FirebaseWeb3Connect.isConnectWithLink();
    if (!connectFromEmailLink) {
      presentAlert({
        backdropDismiss: false,
        header: 'Error',
        subHeader: 'Authentication failed.',
        message: 'Unable to access to this page without email connection link. Restart application & try again.',
      })
      return ()=> {};
    }
    presentLoader({
      message: 'Authenticate with email link...'
    });
    void (async ()=> {
      try {
        await web3Connector.connectWithLink();
        await dismissLoader();
        await presentAlert({
          backdropDismiss: false,
          header: 'Authentication',
          subHeader: 'Success',
          message: 'You can close this page & go back to the app.',
        });
      } catch (error) {
        await dismissLoader();
        await presentAlert({
          backdropDismiss: false,
          header: 'Error',
          subHeader: 'Authentication failed.',
          message: (error as Error)?.message || 'Unable to authenticate. Restart application & try again.',
          buttons: ['ok']
        });
      }
    })();
  }, []);

  return (
    <IonPage>
      <IonContent className="ion-no-padding"></IonContent>
    </IonPage>
  );
};