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
  IonButtons,
  useIonRouter,
  IonPopover,
} from "@ionic/react";
import { close, openOutline, saveOutline, ribbonOutline } from "ionicons/icons";
import { getAddressPoints } from "@/servcies/datas.service";
import Store from "@/store";
import { getWeb3State } from "@/store/selectors";
import ConnectButton from "./ConnectButton";
import DisconnectButton from "../DisconnectButton";
import { ToggleLightmode } from "./ToogleLightmode";
import { PointsPopover } from "../PointsPopover";
import web3Connector from "@/servcies/firebase-web3-connect";

interface MenuSettingsProps {
  dismiss: ()=> void
}

export const MenuSettings: React.FC<MenuSettingsProps> = ({dismiss}) => {
  const { walletAddress } = Store.useState(getWeb3State);
  const [points, setPoints] = useState<string | null>(null);
  const [isPointsPopoverOpen, setIsPointsPopoverOpen] = useState(false);
  const pointsPopoverRef = useRef<HTMLIonPopoverElement>(null);
  const router = useIonRouter();

  const openPopover = (e: any) => {
    pointsPopoverRef.current!.event = e;
    setIsPointsPopoverOpen(true);
  };

  return (
    <>
      <IonHeader translucent={true} class="ion-no-border">
        <IonToolbar style={{ "--background": "transparent" }}>
          <IonTitle>Settings</IonTitle>
          <IonButtons slot="end">
            <IonButton 
              fill="clear" 
              size="small"
              onClick={() => {
                dismiss();
              }}>
              <IonIcon icon={close} size="small" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="mobileConentModal ion-padding">
        <IonItem
          lines="none"
          button={false}
          style={{ "--background": "transparent" }}
          onClick={() => {
            dismiss();
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
          <IonLabel>
            <IonText>
              <h2>Points</h2>
            </IonText>
            <IonText color="medium">
              <p>
                <small>Rank to the leaderboard</small>
              </p>
            </IonText>
          </IonLabel>
          <IonButton
            fill="clear"
            color="gradient"
            style={{ cursor: "pointer" }}
            size={"small"}
            onClick={(e) => openPopover(e)}
          >
            <IonIcon
              color="gradient"
              size="small"
              style={{ marginRight: "0.25rem" }}
              src={ribbonOutline}
            ></IonIcon>
            <IonText className="ion-color-gradient-text">
              Points
            </IonText>
          </IonButton>
        </IonItem>   
        <IonPopover
          ref={pointsPopoverRef}
          className="points-popover"
          isOpen={isPointsPopoverOpen}
          onDidDismiss={() => {
            setPoints(() => null);
            setIsPointsPopoverOpen(false);
          }}
          onWillPresent={async () => {
            if (!walletAddress) {
              throw new Error('Wallet not connected')
            }
            const response = await getAddressPoints(
              walletAddress
            ).catch((error) => {});
            console.log("response", response);
            if (response?.data?.totalPoints) {
              setPoints(() => response.data.totalPoints);
            } else {
              setPoints(() => "0");
            }
          }}
        >
          <PointsPopover
            points={points}
            closePopover={() => setIsPointsPopoverOpen(false)}
          />
        </IonPopover>

        <IonItem 
          lines="none"
          button={false}
          style={{ "--background": "transparent" }}
        >
          <IonLabel>
            <IonText>
              <h2>Dark mode</h2>
            </IonText>
            <IonText color="medium">
              <p>
                <small>Enable or disable dark mode</small>
              </p>
            </IonText>
          </IonLabel>
          <ToggleLightmode />  
        </IonItem> 
        <IonItem
          lines="none"
          button={false}
          style={{ "--background": "transparent" }}
        >
          <IonLabel class="ion-text-wrap">
            <IonText>
              <h2>Backup Wallet</h2>
            </IonText>
            <IonText color="medium">
              <p>
                <small>
                  Download wallet backup
                </small>
              </p>
            </IonText>
          </IonLabel>
          <IonButton
            slot="end"
            fill="clear"
            color="primary"
            onClick={async () => {
              await web3Connector.backupWallet();
            }}
          >
            <IonIcon icon={saveOutline} />
          </IonButton>
        </IonItem>
        <IonItem
          lines="none"
          button={false}
          style={{ "--background": "transparent" }}
        >
          <IonLabel class="ion-text-wrap">
            <IonText>
              <h2>Feedback</h2>
            </IonText>
            <IonText color="medium">
              <p>
                <small>Send your feedback</small>
              </p>
            </IonText>
          </IonLabel>
          <IonButton slot="end" fill="clear" onClick={()=> {
            window.open('https://forms.gle/Dx25eG66TMxyFfh8A', '_blank')
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
