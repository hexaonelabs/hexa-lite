import { IonCol, IonIcon, IonRow, IonText } from "@ionic/react";
import { logoGithub } from "ionicons/icons";

export const FooterComponent: React.FC = () => {
  return (
    <IonRow
      class="ion-align-items-center ion-justify-content-between"
      style={{ background: "rgba(0,0,0, 0.2)" }}
    >
      <IonCol size="auto" class="ion-padding-horizontal">
        <IonText color="medium">
          <p style={{ fontSize: "12px" }}>
            Open source software by{" "}
            <a
              href="https://hexaonelabs.com/"
              rel="noreferrer noopener"
              target="_blank"
            >
              HexaOneLabs
            </a>
          </p>
        </IonText>
      </IonCol>
      <IonCol size="auto" class="ion-padding-horizontal ion-text-end">
        <a
          href="https://twitter.com/hexa_one_labs"
          target="_blank"
          rel="noreferrer noopener"
        >
          <IonIcon
            style={{
              color: "#fff",
              marginRight: "0.25rem",
              fontSize: " 0.8rem",
            }}
            src={"./assets/images/x-logo.svg"}
          ></IonIcon>
        </a>
        <a
          href="https://github.com/hexaonelabs"
          target="_blank"
          rel="noreferrer noopener"
        >
          <IonIcon
            style={{
              color: "#fff",
            }}
            icon={logoGithub}
          ></IonIcon>
        </a>
      </IonCol>
    </IonRow>
  );
};
