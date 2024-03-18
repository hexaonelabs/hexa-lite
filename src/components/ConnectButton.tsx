import Store from "@/store";
import { useLoader } from "../context/LoaderContext";
import { IonButton, IonSkeletonText, useIonToast } from "@ionic/react";
import { getWeb3State } from "@/store/selectors";
import { MouseEvent } from "react";

const ConnectButton = (props: {
  style?: any;
  size?: "small" | "default" | "large";
  expand?: "full" | "block";
}) => {
  const toastContext = useIonToast();
  const presentToast = toastContext[0];
  const dismissToast = toastContext[1];
  // Get the initializeWeb3 function from the Web3 context
  const { connectWallet, web3Provider } = Store.useState(getWeb3State);
  const { display: displayLoader, hide: hideLoader } = useLoader();
  // Define the event handler for the button click
  const handleConnect = async () => {
    try {
      // Display the loader while the connection is being made
      await displayLoader();
      await connectWallet();
      // Hide the loader
      await hideLoader();
    } catch (error: any) {
      // Hide the loader
      await hideLoader();
      // Log any errors that occur during the connection process
      // filter out the error message if user stop the connection ([-32603] Internal JSON-RPC error.)
      if (error?.code === -32603) {
        return;
      }
      console.error("[ERROR] handleConnect:", error);
      await presentToast({
        message: `[ERROR] Connect Failed with reason: ${
          error?.message || error
        }`,
        color: "danger",
        buttons: [
          {
            text: "x",
            role: "cancel",
            handler: () => {
              dismissToast();
            },
          },
        ],
      });
    }
  };

  // Render the button component with the click event handler
  return (
    <IonButton
      size={props?.size || "default"}
      style={props.style || {}}
      expand={props?.expand || undefined}
      disabled={web3Provider === null}
      color="gradient"
      onClick={async ($event)=> {
        $event.currentTarget.disabled = true;
        try {
          await handleConnect();
          $event.currentTarget.disabled = false;
        } catch (err: any) {
          $event.currentTarget.disabled = false;
        }
      }}
    >
      {web3Provider === null ? (
        <IonSkeletonText animated style={{ width: "80px", height: "50%" }} />
      ) : (
        "Connect"
      )}
    </IonButton>
  );
};

export default ConnectButton;
