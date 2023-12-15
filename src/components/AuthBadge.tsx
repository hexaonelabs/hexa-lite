import {
  IonAvatar,
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonRow,
  IonSelect,
  IonSelectOption,
  IonText,
  useIonAlert,
  useIonModal,
  useIonToast,
} from "@ionic/react";
import {
  copyOutline,
  checkmark,
  checkmarkCircle,
  closeSharp,
} from "ionicons/icons";
import { useEffect, useState } from "react";
import { getAvatarFromEVMAddress } from "../servcies/avatar";
import { getSplitedAddress } from "../utils/getSplitedAddress";
import DisconnectButton from "./DisconnectButton";
import ShowUIButton from "./ShowUIButton";
import { useWeb3Provider } from "../context/Web3Context";
import { CHAIN_AVAILABLES, CHAIN_DEFAULT } from "@/constants/chains";
import { SuccessCopyAddress } from "./SuccessCopyAddress";
import { LoaderProvider, useLoader } from "@/context/LoaderContext";
import { SelectNetwork } from "./SelectNetwork";

export const AuthBadge: React.FC<any> = () => {
  const { walletAddress, currentNetwork, switchNetwork, isMagicWallet } = useWeb3Provider();
  const { display: displayLoader, hide: hidLoader } = useLoader();
  const [avatarUrl, setAvatarUrl] = useState("");
  const chain =
    CHAIN_AVAILABLES.find((chain) => chain.id === currentNetwork) ||
    CHAIN_DEFAULT;
  const [presentSuccessCopyAddress, dismissSuccessCopyAddress] = useIonModal(
    () => (
      <SuccessCopyAddress
        walletAddress={walletAddress || ""}
        chain={chain}
        dismiss={dismissSuccessCopyAddress}
      />
    )
  );
  const [presentSelectNetwork, dismissSelectNetwork] = useIonModal(() => (
    <SelectNetwork chains={CHAIN_AVAILABLES} isMagicWallet={isMagicWallet} dismiss={dismissSelectNetwork} />
  ));

  const handleActions = async (type: string, payload: string) => {
    await displayLoader();
    switch (true) {
      case type === "copy": {
        navigator?.clipboard?.writeText(payload);
        // display toast confirmation
        presentSuccessCopyAddress({
          cssClass: "modalAlert",
          onDidDismiss(event) {
            console.log("onDidDismiss", event.detail.role);
            if (!event.detail.role || event?.detail?.role === 'cancel') return;
            handleActions(event.detail.role, payload);
          },
        });
        break;
      }
      case type === "selectNetwork": {
        presentSelectNetwork({
          cssClass: "modalAlert",
          onDidDismiss(event) {
            if (!event.detail.role || event?.detail?.role === 'cancel') return;
            handleActions(event.detail.role, event.detail.data).then(() =>
              hidLoader()
            );
          },
        });
        break;
      }
      case type === "getAddressFromNetwork": {
        await switchNetwork(Number(payload));
        dismissSelectNetwork(null, "cancel");
        await handleActions("copy", `${walletAddress}`);
        break;
      }
      default:
        break;
    }
    await hidLoader();
  };

  useEffect(() => {
    const getAvatar = async () => {
      if (!walletAddress) return;
      try {
        // If account and web3 are available, get the balance
        const avatarUrl = await getAvatarFromEVMAddress(walletAddress);
        // Convert the balance from Wei to Ether and set the state variable
        setAvatarUrl(avatarUrl);
      } catch (error) {
        console.error(error);
      }
    };

    getAvatar();
  }, [walletAddress]);

  if (!walletAddress) return <></>;

  return (
    <>
      <IonListHeader>
        <IonLabel>Wallet</IonLabel>
      </IonListHeader>
      <IonItem
        className="ion-margin-vertical"
        lines="none"
        style={{ "--background": "transparent" }}
      >
        <IonAvatar slot="start">
          <img src={chain.logo} alt="avatar" />
        </IonAvatar>

        <IonLabel style={{ margin: "0", lineHeight: "1rem" }}>
          <IonText color="medium" style={{ display: "block" }}>
            <small>{chain.name} Network</small>
          </IonText>
          <IonText color="success" style={{ 
            display: "flex", 
            alignItems: 'center',
            padding: '0.15rem 0' }}>
            <IonIcon
              style={{
                display: "inline-block",
                marginRight: "0.25rem",
              }}
              src={checkmarkCircle}
            ></IonIcon>
            Connected
          </IonText>
        </IonLabel>
        <IonIcon
          size="small"
          onClick={() => handleActions("copy", walletAddress)}
          slot="end"
          icon={copyOutline}
          style={{ cursor: "pointer" }}
        />
      </IonItem>
      <div className="ion-text-center ion-padding">
        <ShowUIButton />
        <DisconnectButton />
      </div>
    </>
  );
};
