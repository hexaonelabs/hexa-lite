import {
  IonAlert,
  IonAvatar,
  IonButton,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonListHeader,
  IonModal,
  IonPopover,
  IonText,
  useIonToast,
} from "@ionic/react";
import { useEthersProvider } from "../context/Web3Context";
import { disconnect, getMagic } from "../servcies/magic";
import { useWallet } from "@lifi/widget";
import React, { useEffect, useRef, useState } from "react";
import { useUser } from "../context/UserContext";
import { copyOutline, closeSharp } from "ionicons/icons";
import { getAvatarFromEVMAddress } from "../servcies/avatar";
import ShowUIButton from "./ShowUIButton";
import { useLoader } from "../context/LoaderContext";


const DisconnectButton = (props: {
  style?: any;
  size?: "small" | "default" | "large";
  expand?: "full" | "block";
}) => {
  const { display: displayLoader, hide: hideLoader } = useLoader();
  // Get the initializeWeb3 function from the Web3 context
  const { initializeWeb3 } = useEthersProvider();

  // Define the event handler for the button click
  const handleDisconnect = async () => {
    try {
      // Display the loader while the disconnection is being made
      await displayLoader();
      await disconnect();
      // After successful disconnection, re-initialize the Web3 instance
      await initializeWeb3();
      // Hide the loader
      await hideLoader();
    } catch (error) {
      // Log any errors that occur during the disconnection process
      console.log("handleDisconnect:", error);
      // Hide the loader
      await hideLoader();
    }
  };

  // Render the button component with the click event handler
  return (
    <IonButton
      size={props?.size || "default"}
      style={{...props?.style, cursor: "pointer" }}
      color="gradient"
      expand={props?.expand || "block"}
      onClick={(e) => {
        // disable button
        e.currentTarget.disabled = true;
        // disconnect wallet
        handleDisconnect();
      }}
    >
      Disconnect
    </IonButton>
  );
};

export default DisconnectButton;
