
import { useLoader } from "../context/LoaderContext";
import { useWeb3Provider } from "../context/Web3Context"
import { IonButton, IonSkeletonText, useIonToast } from "@ionic/react"

const ConnectButton = (props: {
  style?: any;
  size?: "small" | "default" | "large";
  expand?: "full" | "block";
}) => {
  const toastContext = useIonToast();
  const presentToast = toastContext[0];
  const dismissToast = toastContext[1];
  // Get the initializeWeb3 function from the Web3 context
  const { connectWallet, web3Provider } = useWeb3Provider()
  const { display: displayLoader, hide: hideLoader } = useLoader();
  // Define the event handler for the button click
  const handleConnect = async () => {
    // present({ 
    //   inputs: [{ name: 'email', type: 'email', placeholder: 'Email' }],
    //   buttons: [
    //     { text: 'Cancel', handler: (d) => dismiss() },
    //     { text: 'Ok', role: 'ok' },
    //   ],
    //   onDidDismiss: async (event) =>{
    //     console.log('did dismiss', event);
    //     const { detail: {data, role} } = event;
    //     if (role !== 'ok') {
    //       return;
    //     }
    //     const { email } = data.values;
    //     console.log('email', email);
    //     const address = await connect();
    //     console.log('address', address);
    //     await initializeWeb3();
    //   },
    // });

    try {
      // Display the loader while the connection is being made
      await displayLoader();
      await connectWallet();
      // Hide the loader
      await hideLoader();
    } catch (error:any) {
      // Hide the loader
      await hideLoader();
      // Log any errors that occur during the connection process
      // filter out the error message if user stop the connection ([-32603] Internal JSON-RPC error.)
      if (error?.code === -32603) {
        return;
      }
      console.error("[ERROR] handleConnect:", error);
      await presentToast({
        message: `[ERROR] Connect Failed with reason: ${error?.message||error}`,
        color: "danger",
        buttons: [
          { text: 'x', role: 'cancel', handler: () => {
            dismissToast();
          }}
        ]
      });
    }
  }

  // Render the button component with the click event handler
  return <IonButton 
    size={props?.size||'default'} 
    style={props.style||{}} 
    expand={props?.expand||undefined}
    disabled={web3Provider === null}
    color="gradient"
    onClick={handleConnect}>{web3Provider === null 
      ? <IonSkeletonText animated style={{ width: '80px', height: '50%' }} /> 
      : 'Connect'}</IonButton>
}

export default ConnectButton