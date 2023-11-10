import React, { useRef, useState } from "react";
import {
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonIcon,
  IonLabel,
  IonListHeader,
  IonText,
  IonItemDivider,
  IonButton,
  IonModal,
} from "@ionic/react";
import { home, person, settings } from "ionicons/icons";
import ConnectButton from "./ConnectButton";
import DisconnectButton from "./DisconnectButton";
import { useUser } from "../context/UserContext";
import { getSplitedAddress } from "../utils/getSplitedAddress";
import { AuthBadge } from "./AuthBadge";

interface MenuSlideProps {
  handleSegmentChange: (e: { detail: { value: string } }) => void;
  // onToggle: () => void;
}

const MenuSlide: React.FC<MenuSlideProps> = ({ handleSegmentChange }) => {
  const { user } = useUser();
  const menuRef = useRef<HTMLIonMenuElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <IonMenu ref={menuRef} side="end" contentId="main-content">
      <IonHeader mode="md" translucent={true} class="ion-no-border">
        <IonToolbar style={{ "--background": "transparent" }}>
          <IonTitle>Menu</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
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
              <p>Swap tokens instantly at the best rates.</p>
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
              <p>Earn interest on your crypto.</p>
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
              <p>Provide liquidity and earn interest.</p>
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
              <p>Buy crypto with fiat.</p>
            </IonText>
          </IonLabel>
        </IonItem>

        <IonItemDivider
          style={{ "--background": "transparent" }}
        ></IonItemDivider>

        <div className="ion-padding ion-text-center">
          {!user ? (
            <ConnectButton size="default" expand="block"></ConnectButton>
          ) : (
            <>
              <IonButton
                id="badge-auth-mobile"
                size={"default"}
                style={{ cursor: "pointer" }}
                color="gradient"
                expand={"block"}
              >
                {getSplitedAddress(user)}
              </IonButton>
              <IonModal
                trigger="badge-auth-mobile"
                className="modalAlert"
                onIonModalWillDismiss={() => menuRef.current?.close()}
              >
                <AuthBadge />
              </IonModal>
            </>
          )}
        </div>
      </IonContent>
    </IonMenu>
  );
};

export default MenuSlide;
