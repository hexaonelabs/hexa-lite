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
} from "@ionic/react";
import { radioButtonOn, ribbonOutline } from "ionicons/icons";
import ConnectButton from "./ui/ConnectButton";
import { AuthBadge } from "./AuthBadge";
import { getAddressPoints } from "@/servcies/datas.service";
import { PointsPopover } from "./PointsPopover";
import Store from "@/store";
import { getWeb3State } from "@/store/selectors";

interface MenuSlideProps {
  handleSegmentChange: (e: { detail: { value: string } }) => void;
  // onToggle: () => void;
}

const MenuSlide: React.FC<MenuSlideProps> = ({ handleSegmentChange }) => {
  const menuRef = useRef<HTMLIonMenuElement>(null);
  const { walletAddress } = Store.useState(getWeb3State);
  const [points, setPoints] = useState<string | null>(null);

  return (
    <IonMenu ref={menuRef} side="end" contentId="main-content">
      <IonHeader mode="md" translucent={true} class="ion-no-border">
        <IonToolbar style={{ "--background": "transparent" }}>
          <IonTitle>Hexa Lite</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding-top">
        <IonItem
          lines="none"
          button={true}
          style={{ "--background": "transparent" }}
          onClick={() => {
            menuRef.current?.close();
            handleSegmentChange({
              detail: { value: "swap" },
            });
          }}
        >
          <IonLabel class="ion-text-wrap">
            <IonText>
              <h2>Exchange</h2>
            </IonText>
            <IonText color="medium">
              <p>Swap tokens instantly at the best rates</p>
            </IonText>
          </IonLabel>
        </IonItem>

        <IonItem
          lines="none"
          button={true}
          style={{ "--background": "transparent" }}
          onClick={() => {
            menuRef.current?.close();
            handleSegmentChange({
              detail: { value: "earn" },
            });
          }}
        >
          <IonLabel class="ion-text-wrap">
            <IonText>
              <h2>Earn Interest</h2>
            </IonText>
            <IonText color="medium">
              <p>Earn interest on your crypto with liquid staking</p>
            </IonText>
          </IonLabel>
        </IonItem>

        <IonItem
          lines="none"
          button={true}
          style={{ "--background": "transparent" }}
          onClick={() => {
            menuRef.current?.close();
            handleSegmentChange({
              detail: { value: "defi" },
            });
          }}
        >
          <IonLabel class="ion-text-wrap">
            <IonText>
              <h2>Lending & Borrow</h2>
            </IonText>
            <IonText color="medium">
              <p>Provide liquidity over DeFi protocols and earn interest</p>
            </IonText>
          </IonLabel>
        </IonItem>

        <IonItem
          lines="none"
          button={true}
          style={{ "--background": "transparent" }}
          onClick={() => {
            menuRef.current?.close();
            handleSegmentChange({
              detail: { value: "fiat" },
            });
          }}
        >
          <IonLabel>
            <IonText>
              <h2>Buy</h2>
            </IonText>
            <IonText color="medium">
              <p>Buy crypto with fiat</p>
            </IonText>
          </IonLabel>
        </IonItem>

        <IonItemDivider
          style={{ "--background": "transparent" }}
        ></IonItemDivider>

        <div className="ion-padding ion-text-center">
          {!walletAddress ? (
            <>
              <IonButton
                disabled={true}
                fill="clear"
                color="gradient"
                style={{ cursor: "pointer" }}
                size={"small"}
              >
                <IonIcon
                  color="gradient"
                  size="small"
                  style={{ marginRight: "0.25rem" }}
                  src={ribbonOutline}
                ></IonIcon>
                <IonText className="ion-color-gradient-text">Points</IonText>
              </IonButton>
              <ConnectButton size="default" expand="block"></ConnectButton>
            </>
          ) : (
            <>
              <IonButton
                id="points-btn-mobile"
                fill="clear"
                color="gradient"
                style={{ cursor: "pointer" }}
                size={"small"}
              >
                <IonIcon
                  color="gradient"
                  size="small"
                  style={{ marginRight: "0.25rem" }}
                  src={ribbonOutline}
                ></IonIcon>
                <IonText className="ion-color-gradient-text">Points</IonText>
              </IonButton>
              <IonButton
                id="badge-auth-mobile"
                size={"default"}
                style={{ cursor: "pointer" }}
                color="gradient"
                expand={"block"}
              >
                <IonIcon
                  color="success"
                  className="connectedIcon"
                  src={radioButtonOn}
                ></IonIcon>
                Connected
              </IonButton>
              <IonModal
                trigger="badge-auth-mobile"
                className="modalAlert"
                onIonModalWillDismiss={() => menuRef.current?.close()}
              >
                <AuthBadge />
              </IonModal>
              <IonModal
                trigger="points-btn-mobile"
                className="points-popover modalAlert"
                onDidDismiss={() => setPoints(() => null)}
                onWillPresent={async () => {
                  const response = await getAddressPoints(walletAddress).catch(
                    (error) => {}
                  );
                  console.log("response", response);
                  if (response?.data?.totalPoints) {
                    setPoints(() => response.data.totalPoints);
                  } else {
                    setPoints(() => "0");
                  }
                }}
              >
                <PointsPopover points={points} />
              </IonModal>
            </>
          )}
        </div>
      </IonContent>
    </IonMenu>
  );
};

export default MenuSlide;
