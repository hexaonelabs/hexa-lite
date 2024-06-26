import { CHAIN_AVAILABLES, CHAIN_DEFAULT } from "@/constants/chains";
import { useLoader } from "@/context/LoaderContext";
import Store from "@/store";
import { getWeb3State } from "@/store/selectors";
import {
  IonAvatar,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonListHeader,
  IonSpinner,
  IonText,
  useIonModal,
} from "@ionic/react";
import { checkmarkCircle, copyOutline, openOutline, saveOutline } from "ionicons/icons";
import DisconnectButton from "./DisconnectButton";
import { SelectNetwork } from "./SelectNetwork";
import { SuccessCopyAddress } from "./SuccessCopyAddress";
import { ToggleLightmode } from "./ui/ToogleLightmode";
import web3Connector from "@/servcies/firebase-web3-connect";

export const AuthBadge: React.FC<any> = () => {
  const { walletAddress, currentNetwork, switchNetwork } =
    Store.useState(getWeb3State);
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
      isExternalWallet={false}
      dismiss={dismissSelectNetwork}
    />
  ));

  const handleActions = async (type: string, payload?: string) => {
    await displayLoader();
    switch (true) {
      case type === "copy" && payload !== undefined: {
        navigator?.clipboard?.writeText(`${payload}`);
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
      case type === 'backup': {
        await web3Connector.backupWallet()
      }
      default:
        break;
    }
    await hidLoader();
  };

  if (!walletAddress)
    return (
      <>
        <IonSpinner />
      </>
    );

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
        <IonLabel>Dark mode</IonLabel>
        <ToggleLightmode />
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
        <IonButton
          slot="end"
          fill="clear"
          onClick={() => {
            window.open("https://forms.gle/Dx25eG66TMxyFfh8A", "_blank");
          }}
        >
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
          onClick={() => handleActions('backup')}
        >
          <IonIcon icon={saveOutline} />
        </IonButton>
      </IonItem>
      <div className="ion-text-center ion-padding">
        <DisconnectButton />
      </div>
    </>
  );
};
