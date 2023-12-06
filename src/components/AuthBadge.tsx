import {
  IonAvatar,
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonIcon,
  IonItem,
  IonLabel,
  IonListHeader,
  IonRow,
  IonText,
  useIonAlert,
  useIonModal,
  useIonToast,
} from "@ionic/react";
import { copyOutline, checkmark, checkmarkCircleOutline, closeSharp } from "ionicons/icons";
import { useEffect, useState } from "react";
import { getAvatarFromEVMAddress } from "../servcies/avatar";
import { getSplitedAddress } from "../utils/getSplitedAddress";
import DisconnectButton from "./DisconnectButton";
import ShowUIButton from "./ShowUIButton";
import { useWeb3Provider } from "../context/Web3Context";
import { CHAIN_AVAILABLES, CHAIN_DEFAULT } from "@/constants/chains";

export const AuthBadge: React.FC<any> = () => {
  const { walletAddress, currentNetwork } = useWeb3Provider();
  const [avatarUrl, setAvatarUrl] = useState("");
  const chain = CHAIN_AVAILABLES.find((chain) => chain.id === currentNetwork) || CHAIN_DEFAULT;
  const [present, dismiss] = useIonModal(()=> {
    return (<>
      <IonGrid>
        <IonRow>
          <IonCol className="ion-text-center ion-padding">
          <IonButton
            size="small"
            fill="clear"
            style={{ position: "absolute", top: "0.25rem", right: "0rem" }}
            onClick={() => dismiss(null, "cancel")}
          >
            <IonIcon slot="icon-only" icon={closeSharp}></IonIcon>
          </IonButton>
            <IonText>
              <IonIcon 
              color="success" 
              style={{
                display: "block",
                fontSize: "5rem",
                margin: '1rem auto'
              }} src={checkmarkCircleOutline} />
              <h3>Address Copied</h3>
            </IonText>
            <IonText color="medium">
              <p style={{fontSize: '60%'}}>
                {walletAddress}
              </p>
            </IonText>
            <IonText>
              <p>Address successfuly copy to clipboard. 
                Be careful, only transfer <b>{chain.name} Network</b> tokens to this address.</p>
            </IonText>
            <IonButton
            color="gradient"
            fill="solid"
            expand="block"
            style={{  margin: "1.5rem auto 0" }}
            onClick={() => dismiss(null, "cancel")}
          >
            OK
          </IonButton>
          </IonCol>
        </IonRow>
      </IonGrid>
    </>)
  });
  const handleActions = async (type: string, payload: string) => {
    if (type === "copy") {
      navigator?.clipboard?.writeText(payload);
      // display toast confirmation
      await present({
        cssClass: 'modalAlert',
        // header: "Address Copied",
        // subHeader: payload,
        // message: `Full ${chain.name} Network address copy to clipboard. Be careful, only transfer ${chain.name} Network tokens to this address.`,
        // buttons: ["OK"],

      });
    }
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
      <IonItem className="ion-margin-vertical" lines="none" style={{"--background": "transparent"}}>
        <IonAvatar slot="start">
          <img src={avatarUrl} alt="avatar" />
        </IonAvatar>
        <IonLabel style={{ margin: "0", lineHeight: "1rem" }}>
          <IonText color="medium" style={{ display: "block" }}>
            <small>{chain.name} Network</small>
          </IonText>
          <IonText color="success">
            <IonIcon style={{
                  display: "inline-block",
                  verticalAlign: "top",
                  marginRight: "0.25rem"
            }} src={checkmark}></IonIcon>
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
