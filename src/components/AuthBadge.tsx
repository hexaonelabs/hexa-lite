import {
  IonAvatar,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonListHeader,
  IonText,
  useIonToast,
} from "@ionic/react";
import { copyOutline } from "ionicons/icons";
import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { getAvatarFromEVMAddress } from "../servcies/avatar";
import { getSplitedAddress } from "../utils/getSplitedAddress";
import DisconnectButton from "./DisconnectButton";
import ShowUIButton from "./ShowUIButton";

export const AuthBadge: React.FC<any> = () => {
  const { user } = useUser();
  const [avatarUrl, setAvatarUrl] = useState("");
  const [present, dismiss] = useIonToast();

  const handleActions = async (type: string, payload: string) => {
    if (type === "copy") {
      navigator?.clipboard?.writeText(payload);
      // display toast confirmation
      await present({
        message: `Full address copy to clipboard: ${payload}`,
        duration: 5000,
        color: "success",
      });
    }
  };

  useEffect(() => {
    const getAvatar = async () => {
      if (!user) return;
      try {
        // If account and web3 are available, get the balance
        const avatarUrl = await getAvatarFromEVMAddress(user);
        // Convert the balance from Wei to Ether and set the state variable
        setAvatarUrl(avatarUrl);
      } catch (error) {
        console.error(error);
      }
    };

    getAvatar();
  }, [user]);

  if (!user) return <></>;

  return (
    <>
      <IonListHeader>
        <IonLabel>Wallet connected</IonLabel>
      </IonListHeader>
      <IonItem className="ion-margin-vertical" lines="none" style={{"--background": "transparent"}}>
        <IonAvatar slot="start">
          <img src={avatarUrl} alt="avatar" />
        </IonAvatar>
        <IonLabel style={{ margin: "0", lineHeight: "1rem" }}>
          <IonText color="medium" style={{ display: "block" }}>
            <small>Shortened address</small>
          </IonText>
          {getSplitedAddress(user)}
        </IonLabel>
        <IonIcon
          size="small"
          onClick={() => handleActions("copy", user)}
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
