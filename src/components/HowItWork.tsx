import {
  IonButton,
  IonCol,
  IonGrid,
  IonIcon,
  IonModal,
  IonRow,
  IonSpinner,
  IonText,
} from "@ionic/react";
import { closeSharp } from "ionicons/icons";
import { useState } from "react";

export function HowItWork({ children }: { children?: React.ReactNode }) {
  const [isDisplayHowItWork, setIsDisplayHowItWork] = useState(false);
  const contentElement = children ? children : <IonSpinner />;

  return (
    <>
      <IonButton
        size="small"
        fill="clear"
        onClick={() => setIsDisplayHowItWork(true)}
      >
        how it work
      </IonButton>
      <IonModal
        className="modalAlert"
        isOpen={isDisplayHowItWork}
        onWillDismiss={() => setIsDisplayHowItWork(false)}
      >
        <IonGrid className="ion-no-padding">
          <IonRow class="ion-align-items-top ion-padding">
            <IonCol size="10">
              <IonText>
                <h3 style={{marginBottom: 0}}>
                  <b>How it work</b>
                </h3>
              </IonText>
              <IonText color="medium">
                <p className="ion-no-margin">
                  <small>
                    Strategy process below explained how you can incrase your
                    APY revard.
                  </small>
                </p>
              </IonText>
            </IonCol>
            <IonCol size="2" class="ion-text-end">
              <IonButton
                size="small"
                fill="clear"
                onClick={() => setIsDisplayHowItWork(false)}
              >
                <IonIcon slot="icon-only" icon={closeSharp}></IonIcon>
              </IonButton>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="12">
              <div className="ion-margin-bottom">{contentElement}</div>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonModal>
    </>
  );
}
