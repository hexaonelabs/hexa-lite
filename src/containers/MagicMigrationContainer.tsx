import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCol,
  IonContent,
  IonFooter,
  IonGrid,
  IonHeader,
  IonRow,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";

export default function MagicMigrationContainer(props: {
  setIsMagicMigrationModalOpen: (state: boolean) => void;
}) {
  const { setIsMagicMigrationModalOpen } = props;

  return (
    <>
      <IonHeader className="ion-no-border" translucent={true}>
        <IonToolbar style={{ "--background": "transparent" }}>
          <IonTitle>Hexa Lite Update</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="defaultBackgroundColor">
        <IonGrid>
          <IonRow>
            <IonCol size="12">
              <p className="ion-padding">
                We're thrilled to announce the launch of our new Wallet
                solution! 🎉
              </p>

              <p className="ion-padding-horizontal ion-padding-bottom ion-margin-bottom">
                100% non-custodial, now you have complete
                control over your Wallet & can manage all your financial assets securely.
              </p>
              <h2 className="ion-padding-horizontal ion-padding-top">
                Migration Guide with 2 steps
              </h2>

              <IonCard
                className="ion-color"
                style={{ border: "solid 1px var(--ion-color-primary)" }}
              >
                <IonCardHeader>
                  <b>1: Magic Link</b>
                </IonCardHeader>
                <IonCardContent>
                  <ul className="ion-padding-horizontal ion-no-margin">
                    <li>
                      Go to{" "}
                      <a
                        href="https://wallet.magic.link/"
                        target="_blank"
                        rel="noopener"
                      >
                        https://wallet.magic.link
                      </a>
                      .
                    </li>
                    <li>Connect to your Wallet with usual method.</li>
                    <li>Click you avatar on top left of the wallet card.</li>
                    <li>
                      Click on <i>Wallet secret phrase</i>.
                    </li>
                    <li>Get you Wallet secret phrase.</li>
                  </ul>
                </IonCardContent>
              </IonCard>

              <IonCard
                className="ion-color"
                style={{ border: "solid 1px var(--ion-color-primary)" }}
              >
                <IonCardHeader>
                  <b>2: Hexa Lite</b>
                </IonCardHeader>
                <IonCardContent>
                  <ul className="ion-padding-horizontal ion-no-margin">
                    <li>
                      Back to HexaLite App, click Connect button & select <i>Connect Wallet ➡ Import secret seed</i>{" "}
                      option.
                    </li>
                    <li>Use you secret seed & connect with Google.</li>
                    <li>
                      Backup your secret seed phrase to ensure that you never
                      loose your wallet access.
                    </li>
                  </ul>
                </IonCardContent>
              </IonCard>

              <IonText>
                <p className="ion-padding ion-margin-vertical">
                  Congrate!
                  <br />
                  Now you're ready to enjoy DeFi services with full non-custodial Wallet.
                </p>
                <p className="ion-padding ion-margin-vertical">
                  Hexa Lite Team
                </p>
              </IonText>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
      <IonFooter>
        <IonToolbar style={{ "--background": "var(--ion-color-background)" }}>
          <IonButton
            expand="block"
            onClick={() => setIsMagicMigrationModalOpen(false)}
          >
            OK
          </IonButton>
        </IonToolbar>
      </IonFooter>
    </>
  );
}
