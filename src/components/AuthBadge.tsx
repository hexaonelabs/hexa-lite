import { CHAIN_AVAILABLES, CHAIN_DEFAULT } from "@/constants/chains";
import { useLoader } from "@/context/LoaderContext";
import Store from "@/store";
import { getWeb3State } from "@/store/selectors";
import {
  IonAvatar,
  IonIcon,
  IonItem,
  IonLabel,
  IonListHeader,
  IonSpinner,
  IonText,
  useIonModal
} from "@ionic/react";
import {
  checkmarkCircle,
  copyOutline,
} from "ionicons/icons";
import DisconnectButton from "./DisconnectButton";
import { SelectNetwork } from "./SelectNetwork";
import ShowUIButton from "./ShowUIButton";
import { SuccessCopyAddress } from "./SuccessCopyAddress";
import { ToggleLightmode } from "./ui/ToogleLightmode";

export const AuthBadge: React.FC<any> = () => {
  const {
    walletAddress,
    currentNetwork,
    isMagicWallet,
    switchNetwork,
  } = Store.useState(getWeb3State);
  const { display: displayLoader, hide: hidLoader } = useLoader();
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
    <SelectNetwork
      chains={CHAIN_AVAILABLES}
      isMagicWallet={isMagicWallet}
      dismiss={dismissSelectNetwork}
    />
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
            if (!event.detail.role || event?.detail?.role === "cancel") return;
            handleActions(event.detail.role, payload);
          },
        });
        break;
      }
      case type === "selectNetwork": {
        presentSelectNetwork({
          cssClass: "modalAlert",
          onDidDismiss(event) {
            if (!event.detail.role || event?.detail?.role === "cancel") return;
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

  if (!walletAddress) return (<>
    <IonSpinner />
  </>);

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
          <IonText
            color="success"
            style={{
              display: "flex",
              alignItems: "center",
              padding: "0.15rem 0",
            }}
          >
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
          onClick={() => handleActions("copy", walletAddress || "")}
          slot="end"
          icon={copyOutline}
          style={{ cursor: "pointer" }}
        />
      </IonItem>
      <IonItem 
          lines="none"
          button={false}
          style={{ "--background": "transparent" }}
        >
          <IonLabel>
            Dark mode
          </IonLabel>
          <ToggleLightmode />  
        </IonItem> 
      <div className="ion-text-center ion-padding">
        <ShowUIButton />
        <DisconnectButton />
      </div>
    </>
  );
};
