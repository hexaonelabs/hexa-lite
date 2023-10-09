import {
  IonContent,
  IonItem,
  IonItemDivider,
  IonLabel,
  IonListHeader,
  IonText,
} from "@ionic/react";
import { useRef } from "react";
import ConnectButton from "./ConnectButton";
import DisconnectButton from "./DisconnectButton";
import { useUser } from "../context/UserContext";

export function MenuPopover({
  handleSegmentChange,
  popoverRef
}: {
  handleSegmentChange: (e: { detail: { value: string } }) => void;
  popoverRef: React.RefObject<HTMLIonPopoverElement>;
}) {
  const { user } = useUser();

  return (
    <IonContent class="ion-no-padding">
      <IonListHeader>
        <IonLabel class="ion-no-margin ion-padding-vertical">Menu</IonLabel>
      </IonListHeader>
      <IonItem
        lines="none"
        button={true}
        style={{ "--background": "transparent" }}
        onClick={() => {
          popoverRef.current?.dismiss();
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
          popoverRef.current?.dismiss();
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
          popoverRef.current?.dismiss();
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
          popoverRef.current?.dismiss();
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
      {/* <IonItem button={true} style={{ "--background": "transparent" }}>
                            <IonLabel>
                              <IonText>
                                <h2>Wallet</h2>
                              </IonText>
                              <IonText color="medium">
                                <p>Manage your wallet.</p>
                              </IonText>
                            </IonLabel>
                          </IonItem> */}
      <div
        className="ion-padding ion-text-center"
        onClick={async () => {
          await popoverRef.current?.dismiss();
        }}
      >
        {!user ? (
          <ConnectButton size="default" expand="block"></ConnectButton>
        ) : (
          <DisconnectButton size="default" expand="block"></DisconnectButton>
        )}
      </div>
    </IonContent>
  );
}
