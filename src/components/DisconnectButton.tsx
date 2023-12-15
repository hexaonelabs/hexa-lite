import {
  IonButton,
} from "@ionic/react";
import { useWeb3Provider } from "../context/Web3Context";
import { useLoader } from "../context/LoaderContext";


const DisconnectButton = (props: {
  style?: any;
  size?: "small" | "default" | "large";
  expand?: "full" | "block";
}) => {
  const { display: displayLoader, hide: hideLoader } = useLoader();
  // Get the initializeWeb3 function from the Web3 context
  const { disconnectWallet } = useWeb3Provider();

  // Define the event handler for the button click
  const handleDisconnect = async () => {
    try {
      // Display the loader while the disconnection is being made
      await displayLoader();
      await disconnectWallet();
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
