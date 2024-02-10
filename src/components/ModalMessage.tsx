import React from "react";
import {
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonIcon,
} from "@ionic/react";
import { closeSharp } from "ionicons/icons";

interface ModalMessageProps {
  dismiss: (data?: any, role?: string | undefined) => void;
  children?: React.ReactNode;
}

export const ModalMessage: React.FC<ModalMessageProps> = ({
  dismiss, children
} ) => {
  return (
    <IonGrid>
      <IonRow>
        <IonCol className="ion-text-center ion-padding">
          <IonButton
            size="small"
            fill="clear"
            style={{ position: "absolute", top: "0.25rem", right: "0rem" }}
            onClick={() => dismiss(null, "cancel")}
          >
            <IonIcon slot="icon-only" icon={closeSharp}></IonIcon>
          </IonButton>
          <div>
            {children}
          </div>
          <IonButton
            color="gradient"
            fill="solid"
            expand="block"
            style={{ margin: "0rem auto 0" }}
            onClick={() => dismiss(null, "cancel")}
          >
            OK
          </IonButton>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};
