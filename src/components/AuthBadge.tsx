import { IonButton, IonIcon, IonImg } from "@ionic/react";
import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { getAvatarFromEVMAddress } from "../servcies/avatar";
import ConnectButton from "./ConnectButton";
import DisconnectButton from "./DisconnectButton";

const styleFixed = {
  // position: "fixed",
  // top: "10px",
  // right: "10px",  
  zIndex: "9999",
};

const styleBtn = {
  ...styleFixed,
  minHeight: "56px",
  width: "80px",
  "--background": "var(--ion-item-background)",
  "--background-hover": "var(--ion-item-background)",
  "--border-color": "var(--ion-border-color)",
  "--border-width": "1px",
  "--border-style": "solid",
};

const styleImg = {
  maxWidth: "24px",
  borderRadius: "100%",
  overflow: "hidden",
};

export const AuthBadge = ({user}: {user: string|null}) => {
  // use local state to store the avatar url
  const [avatarUrl, setAvatarUrl] = useState("");
  // use user address to get the avatar url using getAvatarFromEVMAddress()
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


  return (
    user 
      ? (
        <IonButton mode="ios" style={styleBtn}>
          <IonIcon src="./assets/images/logo-colored.svg"></IonIcon>
          <IonImg style={styleImg} src={avatarUrl}></IonImg>
        </IonButton>
        )
      : (
        <ConnectButton style={styleFixed} />
      )
  );
};
