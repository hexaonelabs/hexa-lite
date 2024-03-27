import { IonCol, IonIcon, IonRow, IonText } from "@ionic/react";
import { logoGithub } from "ionicons/icons";

export const FooterComponent: React.FC = () => {
  return (
    <IonRow
      class="FooterComponent ion-align-items-center ion-justify-content-between"
      style={{ 
        background: "rgba(var(--item-background-shader-rgb), 1)",
        borderTop: "solid 1px rgba(var(--ion-color-primary-rgb), 0.2)",
       }}
    >
      <IonCol size="auto" class="ion-padding-horizontal">
        <IonText color="dark">
          <p style={{ fontSize: "12px", lineHeight: '0.9rem', opacity: '0.8' }}>
            Open source software by{" "}
            <a
              href="https://hexaonelabs.com/"
              rel="noreferrer noopener"
              target="_blank"
            >
              HexaOneLabs
            </a>. <br/><a 
              href="./terms-conditions.pdf" 
              target="_blank"
              rel="noreferrer noopener">Terms & Conditions</a>
          </p>
        </IonText>
      </IonCol>
      <IonCol size="auto" class="ion-padding-horizontal ion-text-end">
        {/* <a 
          href="https://snapshot.org/#/hexaonelabs.eth" 
          target="_blank" 
          rel="noreferrer noopener"
          style={{textDecoration: 'none', fontSize: '0.7rem'}}>
          <span>⚡</span>
        </a> */}
        {/* medium link */}
        <a
          href="https://medium.com/@hexaonelabs"
          target="_blank"
          rel="noreferrer noopener"
        >
          <IonIcon
            style={{
              marginRight: "0.25rem",
              fontSize: " 0.8rem",
            }}
            color="dark"
            src={"./assets/icons/medium-icon.svg"}
          ></IonIcon>
        </a>
        {/* twitter link */}
        <a
          href="https://twitter.com/hexa_one_labs"
          target="_blank"
          rel="noreferrer noopener"
        >
          <IonIcon
            style={{
              marginRight: "0.25rem",
              fontSize: " 0.8rem",
            }}
            color="dark"
            src={"./assets/images/x-logo.svg"}
          ></IonIcon>
        </a>
        {/* github link */}
        <a
          href="https://github.com/hexaonelabs"
          target="_blank"
          rel="noreferrer noopener"
        >
          <IonIcon
            color="dark"
            icon={logoGithub}
          ></IonIcon>
        </a>
      </IonCol>
    </IonRow>
  );
};
