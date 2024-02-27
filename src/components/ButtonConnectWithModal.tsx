import Store from "@/store";
import { getWeb3State } from "@/store/selectors";
import {
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonIcon,
  IonImg,
  IonRow,
  IonSkeletonText,
  IonText,
  useIonPopover,
} from "@ionic/react";
import { mail, wallet, logoGoogle } from "ionicons/icons";

export const ButtonConnectWithModal = (props: {
  style?: any;
  size?: "small" | "default" | "large";
  expand?: "full" | "block";
}) => {
  const { connectWallet, web3Provider } = Store.useState(getWeb3State);
  const [present, dismiss] = useIonPopover(
    <IonContent className="ion-padding">
      <IonGrid>
        <IonRow className="ion-text-center">
          <IonCol size="12">
            <IonImg
              src="/assets/images/logo.svg"
              style={{ margin: "0 auto", width: "100px" }}
            />
            <IonText>
              <p>Connect to Hexa Lite</p>
            </IonText>
          </IonCol>
        </IonRow>
      </IonGrid>
      <IonButton
        expand="block"
        color="gradient"
        onClick={async () => {
          dismiss();
          await connectWallet({ oAuth: "google" });
        }}
      >
        <IonIcon slot="start" src={logoGoogle} />
        with Google
      </IonButton>
      <IonButton
        expand="block"
        color="gradient"
        onClick={async () => {
          dismiss();
          await connectWallet({ email: "true" });
        }}
      >
        <IonIcon slot="start" src={mail} />
        with Email
      </IonButton>
      <IonButton
        expand="block"
        color="gradient"
        onClick={async () => {
          dismiss();
          await connectWallet();
        }}
      >
        <IonIcon slot="start" src={wallet} />
        with Wallet
      </IonButton>
    </IonContent>
  );

  return (
    <>
      <IonButton
        size={props?.size || "default"}
        style={props.style || {}}
        expand={props?.expand || undefined}
        disabled={web3Provider === null}
        color="gradient"
        onClick={(e) => {
          present({
            event: e.nativeEvent,
            cssClass: "",
          });
        }}
      >
        {web3Provider === null ? (
          <IonSkeletonText animated style={{ width: "80px", height: "50%" }} />
        ) : (
          "Connect"
        )}
      </IonButton>
    </>
  );
};
