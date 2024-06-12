import Store from "@/store";
import { useLoader } from "../../context/LoaderContext";
import { IonButton, IonSkeletonText, IonSpinner } from "@ionic/react";
import { getWeb3State } from "@/store/selectors";
import { useRef } from "react";

const ConnectButton = (props: {
  style?: any;
  size?: "small" | "default" | "large";
  expand?: "full" | "block";
}) => {
  const { style = {}, size = "default", expand = undefined } = props;
  // Get the initializeWeb3 function from the Web3 context
  const { connectWallet, walletAddress } = Store.useState(getWeb3State);
  const {
    display: displayLoader,
    hide: hideLoader,
    isVisible: isLoaderVisible,
  } = useLoader();
  const buttonRef = useRef<HTMLIonButtonElement>(null);

  // Define the event handler for the button click
  const handleConnect = async () => {
    // Display the loader while the connection is being made
    await displayLoader("Waiting...");
    await connectWallet();
    // Hide the loader
    await hideLoader();
  };

  const isDisabled = isLoaderVisible ? true : Boolean(walletAddress);
  // Render the button component with the click event handler
  return (
    <IonButton
      ref={buttonRef}
      size={size}
      style={style}
      expand={expand}
      disabled={walletAddress === undefined || isDisabled}
      color="gradient"
      onClick={async () => {
        if (!buttonRef.current) {
          throw new Error("Element not connected to DOM");
        }
        buttonRef.current.disabled = true;
        try {
          await handleConnect();
        } catch (err: any) {
          buttonRef.current.disabled = false;
          console.log("[ERROR] {ConnectButton} handleConnect(): ", err);
        }
      }}
    >
      {walletAddress === undefined || isLoaderVisible ? (
        <IonSkeletonText animated style={{ width: "80px", height: "50%" }} />
      ) : (
        "Connect"
      )}
    </IonButton>
  );
};

export default ConnectButton;
