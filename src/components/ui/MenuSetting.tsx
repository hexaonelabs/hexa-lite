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
  IonNote,
} from "@ionic/react";
import { open, openOutline, radioButtonOn, ribbonOutline } from "ionicons/icons";
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
            <IonNote slot="end" color="success" className="ion-text-end">
              Connected
            </IonNote>
        </IonItem>   
        <IonItem
          lines="none"
          button={false}
          style={{ "--background": "transparent" }}
        >
          <IonLabel class="ion-text-wrap">
            <IonText>
              <h2>Gouvernance</h2>
            </IonText>
            <IonText color="medium">
              <p>
                <small>Snapshot</small>
              </p>
            </IonText>
          </IonLabel>
          <IonButton slot="end" fill="clear" onClick={()=> {
            window.open('https://snapshot.org/#/hexaonelabs.eth', '_blank')
          }}>
            <IonIcon icon={openOutline} />
          </IonButton>
        </IonItem> 
        <IonItem
          lines="none"
          button={false}
          style={{ "--background": "transparent" }}
        >
          <IonLabel class="ion-text-wrap">
            <IonText>
              <h2>Source code</h2>
            </IonText>
            <IonText color="medium">
              <p>
                <small>Github</small>
              </p>
            </IonText>
          </IonLabel>
          <IonButton slot="end" fill="clear" onClick={()=> {
            window.open('https://github.com/hexaonelabs', '_blank')
          }}>
            <IonIcon icon={openOutline} />
          </IonButton>
        </IonItem> 
        <IonItem
          lines="none"
          button={false}
          style={{ "--background": "transparent" }}
        >
          <IonLabel class="ion-text-wrap">
            <IonText>
              <h2>Terms & Conditions</h2>
            </IonText>
            <IonText color="medium">
              <p>
                <small>PDF</small>
              </p>
            </IonText>
          </IonLabel>
          <IonButton slot="end" fill="clear" onClick={()=> {
            window.open('https://hexa-lite.io/terms-conditions.pdf', '_blank')
          }}>
            <IonIcon icon={openOutline} />
          </IonButton>
        </IonItem>  
        <IonItem
          lines="none"
          button={false}
          style={{ "--background": "transparent" }}
        >
          <IonLabel class="ion-text-wrap">
            <IonText>
              <h2>Wallet key export</h2>
            </IonText>            
            <IonText color="medium">
              <p>
                <small>Wallet Magik</small>
              </p>
            </IonText>
          </IonLabel>
          <IonButton slot="end" fill="clear" onClick={()=> {
            window.open('https://wallet.magic.link/', '_blank')
          }}>
            <IonIcon icon={openOutline} />
          </IonButton>
        </IonItem>     
        <IonItem
          lines="none"
          button={false}
          style={{ "--background": "transparent" }}
        >
          <IonLabel class="ion-text-wrap">
            <IonText>
              <h2>Version</h2>
            </IonText>            
            <IonText color="medium">
              <p>
                <small>https://hexa-lite.io</small>
              </p>
            </IonText>
          </IonLabel>
          <IonText slot="end"  className="ion-text-end">
            {process.env.NEXT_PUBLIC_APP_VERSION} <br/>
            <small>
              {process.env.NEXT_PUBLIC_APP_BUILD_DATE}
            </small>
          </IonText>
        </IonItem>
      </IonContent>
      <IonFooter>
        <IonToolbar style={{ "--background": "transparent" }}>
          <DisconnectButton />
        </IonToolbar>
      </IonFooter>
    </>
  );
};
