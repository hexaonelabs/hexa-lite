import Store from "@/store";
import { getWeb3State } from "@/store/selectors";
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonSkeletonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { ethers } from "ethers";
import { useState } from "react";

/**
 * React Hook that open modal to connect wallet using IonModal
 * The modal present the options to connect with Magic wallet
 * using Google Auth and email or external wallet using ethereum provider
 */
export const useConnect = () => {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => {
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    open,
    close,
  };
};

const ButtonConnectWithModal = (props: {
  style?: any;
  size?: "small" | "default" | "large";
  expand?: "full" | "block";
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { connectWallet, web3Provider } = Store.useState(getWeb3State);
  const close = () => {
    setIsOpen(false);
  };
  const open = () => {
    setIsOpen(true);
  };

  return (
    <>
      <IonButton
        size={props?.size || "default"}
        style={props.style || {}}
        expand={props?.expand || undefined}
        disabled={web3Provider === null}
        color="gradient"
        onClick={open}
      >
        {web3Provider === null ? (
          <IonSkeletonText animated style={{ width: "80px", height: "50%" }} />
        ) : (
          "Connect"
        )}
      </IonButton>
      <IonModal isOpen={isOpen} onDidDismiss={close}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Connect Wallet</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={close}>Close</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonButton
            expand="full"
            onClick={async () => {
              await connectWallet({ email: "true" });
            }}
          >
            Email
          </IonButton>
          <IonButton expand="full" onClick={() => {}}>
            Connect EVM Wallet
          </IonButton>
        </IonContent>
      </IonModal>
    </>
  );
};
