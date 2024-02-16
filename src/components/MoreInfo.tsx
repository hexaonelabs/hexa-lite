import {
  IonButton,
  IonCol,
  IonGrid,
  IonIcon,
  IonModal,
  IonRow,
  IonText,
} from "@ionic/react";
import {
  informationCircleOutline,
  closeSharp,
} from "ionicons/icons";
import { useState } from "react";

const MoreInfoIconButton = (props: {
  setInfoOpen: (arg: boolean) => void;
}) => {
  return (
    <small>
      <IonIcon
        color="primary"
        style={{
          marginLeft: "0.05rem",
          marginRight: "0.2rem",
          transform: "scale(0.8)",
          cursor: "pointer",
        }}
        size="small"
        icon={informationCircleOutline}
        onClick={() => props.setInfoOpen(true)}
      />
    </small>
  )
};

export function MoreInfo(
  props: { children?: React.ReactNode  }
) {
  const [isInfoOpen, setInfoOpen] = useState(false);

  return (
    <>
      <MoreInfoIconButton setInfoOpen={setInfoOpen} />

      <IonModal
        className="modalAlert autoSize modalInfo"
        isOpen={isInfoOpen}
        onWillDismiss={() => setInfoOpen(false)}
      >
        <IonGrid className="ion-no-padding ion-padding-horizontal ion-padding-bottom">
          <IonRow className="ion-padding-top">
            <IonCol size="10">
              <IonText>
                <h3>
                  <b>Informations</b>
                </h3>
              </IonText>
            </IonCol>
            <IonCol size="2" class="ion-text-end">
              <IonButton
                size="small"
                fill="clear"
                onClick={() => setInfoOpen(false) }
              >
                <IonIcon slot="icon-only" icon={closeSharp}></IonIcon>
              </IonButton>
            </IonCol>
          </IonRow>
          <IonRow class="ion-align-items-top ion-margin-bottom">
            <IonCol size="12">
              {props?.children}
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonModal>
    </>
  );
}
