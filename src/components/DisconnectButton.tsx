
import { IonButton } from "@ionic/react"
import { useEthersProvider } from "../context/Web3Context"
import { magic } from "../servcies/magic"
import { useWallet } from "@lifi/widget";
import React from "react";


const DisconnectButton = (props: {
  style?: any;
  size?: "small" | "default" | "large";
  expand?: "full" | "block";
}) => {
  // Get the initializeWeb3 function from the Web3 context
  const { initializeWeb3 } = useEthersProvider()
  // Define the event handler for the button click
  const handleDisconnect = async () => {
    try {
      // Try to disconnect the user's wallet using Magic's logout method
      await magic.user.logout()
      // After successful disconnection, re-initialize the Web3 instance
      initializeWeb3()
    } catch (error) {
      // Log any errors that occur during the disconnection process
      console.log("handleDisconnect:", error)
    }
  }

  // Render the button component with the click event handler
  return <IonButton 
    size={props?.size||'default'} 
    style={props.style||{}} 
    expand={props?.expand||undefined}
    onClick={handleDisconnect}>Disconnect</IonButton>
}

export default DisconnectButton