import { IonCol, IonGrid, IonRow, IonText } from "@ionic/react";

export function Fiat() {
  return (
    <IonGrid class="ion-no-padding" style={{ marginBottom: "5rem" }}>
      <IonRow class="ion-justify-content-center">
        <IonCol size="12" class="ion-text-center">
          <IonText>
            <h1>Buy crypto</h1>
          </IonText>
          <IonText color="medium">
            <p
              style={{
                lineHeight: "1.5rem",
              }}
            >
              Use your credit card, Google Pay or Apple Pay to buy crypto
              instantly
            </p>
          </IonText>
        </IonCol>
      </IonRow>
      <IonRow>
        <IonCol size="12">
          <div
            style={{
              paddingTop: "1rem",
              paddingBottom: "10rem",
              textAlign: "center",
            }}
          >
            <iframe
              style={{
                maxWidth: "100vw",
                border:
                  "solid 1px rgba(var(--ion-color-primary-rgb), 0.4)",
                borderRadius: "32px",
                overflow: "hidden",
                display: "inline-block",
              }}
              src="https://buy.onramper.com?themeName=dark&cardColor=1c2b42&borderRadius=12px&defaultCrypto=MATIC_POLYGON"
              title="Onramper Widget"
              height="630px"
              width="450px"
              allow="payment"
            />
          </div>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
}