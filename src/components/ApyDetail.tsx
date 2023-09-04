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
  helpOutline,
} from "ionicons/icons";
import { useState } from "react";

export function ApyDetail({ children }: { children?: React.ReactNode }) {
  const [isApyInfoOpen, setIsApyInfoOpen] = useState(false);
  const [isDisplayAPYDef, setIsDisplayAPYDef] = useState(false);

  return (
    <>
      <small>
        <IonIcon
          color="primary"
          style={{
            marginLeft: "0.2rem",
            transform: "scale(0.8)",
            cursor: "pointer",
          }}
          size="small"
          icon={informationCircleOutline}
          onClick={() => setIsApyInfoOpen(true)}
        />
      </small>
      <IonModal
        className="modalAlert infoAPY"
        isOpen={isApyInfoOpen}
        onWillDismiss={() => setIsApyInfoOpen(false)}
      >
        <IonGrid className="ion-padding">
          <IonRow class="ion-align-items-top ion-margin-bottom">
            <IonCol size="10">
              <IonText>
                <h3>
                  <b>
                    {!isDisplayAPYDef ? "Details APY" : "APY Definition"}
                  </b>
                </h3>
                <p className="ion-no-margin">
                  {!isDisplayAPYDef && (
                    <small>
                      Here you can see how the APY{" "}
                      <IonIcon
                        size="small"
                        color="primary"
                        icon={helpOutline}
                        style={{
                          marginLeft: "-0.4rem",
                          transform: "scale(0.6)",
                          cursor: "pointer",
                        }}
                        onClick={() => setIsDisplayAPYDef(true)}
                      />{" "}
                      is calculated.
                    </small>
                  )}
                </p>
              </IonText>
            </IonCol>
            <IonCol size="2" class="ion-text-end">
              <IonButton
                size="small"
                fill="clear"
                onClick={() =>
                  !isDisplayAPYDef
                    ? setIsApyInfoOpen(false)
                    : setIsDisplayAPYDef(false)
                }
              >
                <IonIcon slot="icon-only" icon={closeSharp}></IonIcon>
              </IonButton>
            </IonCol>

            {isDisplayAPYDef && (
              <IonCol size="12">
                <p>
                  <small>
                    The annual percentage yield (APY) is the real rate of return
                    earned on an investment, taking into account the effect of
                    compounding interest. Unlike simple interest, compounding
                    interest is calculated periodically and the amount is
                    immediately added to the balance. With each period going
                    forward, the account balance gets a little bigger, so the
                    interest paid on the balance gets bigger as well.
                  </small>
                </p>
              </IonCol>
            )}
          </IonRow>
          {!isDisplayAPYDef && (
            <IonRow>
              <IonCol>{children}</IonCol>
            </IonRow>
          )}
        </IonGrid>
      </IonModal>
    </>
  );
}
