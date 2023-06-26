import {
  IonAvatar,
  IonButton,
  IonButtons,
  IonContent,
  IonIcon,
  IonImg,
  IonItem,
  IonLabel,
  IonPopover,
  IonText,
  useIonAlert,
  useIonPopover,
} from "@ionic/react";
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

const copyAccountAddressToClipboard = (address: string) => {};


// const PopoverBadge = (user: string) => (
//   <IonContent class="ion-no-padding">
//     <IonItem lines="none" className="item-profil">
//       <IonLabel class="ion-text-nowrap">
//         <label>
//           <IonText color="medium">
//             <small>Connected address</small>
//           </IonText>
//         </label>
//         {user.slice(0, 6)}...{user.slice(-4)}
//       </IonLabel>
//       <IonButtons
//         slot="end"
//         class="ion-no-margin ion-margin-start"
//         onClick={() => copyAccountAddressToClipboard(user)}
//       >
//         <IonButton size="small" fill="clear">
//           <IonIcon
//             color="medium"
//             size="small"
//             slot="icon-only"
//             name="copy-outline"
//           ></IonIcon>
//         </IonButton>
//       </IonButtons>
//     </IonItem>
//     <IonItem
//       lines="none"
//       className="ion-margin-top disconnect-item"
//       onClick={() => (dismiss())}
//     >
//       <IonIcon slot="start" name="log-out-outline"></IonIcon>
//       <IonLabel>
//         <IonText> Disconnect </IonText>
//       </IonLabel>
//     </IonItem>
//   </IonContent>
// );

export const AuthBadge = ({ user }: { user: string | null }) => {
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
  const [diss] = useIonAlert();
  const disconnect = () => {
    
    // present confirmation alert 
    // if confirmed, disconnect
  
  };
  // const [present, dismiss] = useIonPopover(PopoverBadge, {
  //   onDismiss: (data: any, role: string) => dismiss(data, role),
  // });
  // const [roleMsg, setRoleMsg] = useState('');

  return user ? (
    <>
      {/* <IonButton 
        id="profil-trigger" 
        mode="ios" 
        style={styleBtn}
        onClick={(e: any) =>
          // present({
          //   event: e,
          //   onDidDismiss: (e: CustomEvent) => setRoleMsg(`Popover dismissed with role: ${e.detail.role}`),
          // })
          disconnect()
        }>
        <IonIcon src="./assets/images/logo-colored.svg"></IonIcon>
        <IonImg style={styleImg} src={avatarUrl}></IonImg>
      </IonButton>
      <IonPopover
        className="profil-popover"
        trigger="profil-trigger"
        size="auto"
        side="bottom"
        alignment="start"
        keepContentsMounted={true}
        dismissOnSelect={false}
        triggerAction="click"
      >

      </IonPopover> */}
    <DisconnectButton style={styleFixed} />
    </>
  ) : (
    <ConnectButton style={styleFixed} />
  );
};
