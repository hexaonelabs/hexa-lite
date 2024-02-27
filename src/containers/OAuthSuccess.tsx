import { getMagic } from "@/servcies/magic";
import { IonContent, IonPage, IonSpinner, useIonRouter } from "@ionic/react";
import { useEffect } from "react";

export const OAuthSuccess = () => {
  const { canGoBack, goBack } = useIonRouter();
  useEffect(() => {
    getMagic().then(async (magic) => {
      await magic.oauth.getRedirectResult();
      if (canGoBack()) {
        goBack();
      } else {
        window.location.href = "/index";
      }
    });
  }, []);

  return (
    <>
      <IonPage>
        <IonContent>
          <IonSpinner />
        </IonContent>
      </IonPage>
    </>
  );
};
