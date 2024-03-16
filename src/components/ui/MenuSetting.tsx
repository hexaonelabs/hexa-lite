import React, { useRef, useState } from "react";
import {
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonIcon,
  IonLabel,
  IonText,
  IonItemDivider,
  IonButton,
  IonModal,
  IonFooter,
} from "@ionic/react";
import { radioButtonOn, ribbonOutline } from "ionicons/icons";
import { getAddressPoints } from "@/servcies/datas.service";
import Store from "@/store";
import { getWeb3State } from "@/store/selectors";
import ConnectButton from "../ConnectButton";
import DisconnectButton from "../DisconnectButton";

interface MenuSettingsProps {}

export const MenuSettings: React.FC<MenuSettingsProps> = ({}) => {
  const menuRef = useRef<HTMLIonMenuElement>(null);
  const { walletAddress } = Store.useState(getWeb3State);
  const [points, setPoints] = useState<string | null>(null);

  return (
    <>
      <IonHeader translucent={true} class="ion-no-border">
        <IonToolbar style={{ "--background": "transparent" }}>
          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonItem
          lines="none"
          button={false}
          style={{ "--background": "transparent" }}
          onClick={() => {
            menuRef.current?.close();
          }}
        >
          <IonLabel class="ion-text-wrap">
            <IonText>
              <h2>Wallet</h2>
            </IonText>
            <IonText color="medium">
              <p>
                <small>{walletAddress}</small>
              </p>
            </IonText>
          </IonLabel>
        </IonItem>
        <div style={{
          position: 'absolute',
          bottom: '1rem'
        }}>
          <small>
            {`HexaLite v${process.env.NEXT_PUBLIC_APP_VERSION} - ${process.env.NEXT_PUBLIC_APP_BUILD_DATE}`}
          </small>
        </div>
      </IonContent>
      <IonFooter>
        <IonToolbar style={{ "--background": "transparent" }}>
          <DisconnectButton />
        </IonToolbar>
      </IonFooter>
    </>
  );
};
