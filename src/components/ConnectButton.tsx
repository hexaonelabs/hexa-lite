
import { useLoader } from "../context/LoaderContext";
import { useEthersProvider } from "../context/Web3Context"
import { connect } from "../servcies/magic"
import { IonButton, useIonToast } from "@ionic/react"

const ConnectButton = (props: {
  style?: any;
  size?: "small" | "default" | "large";
  expand?: "full" | "block";
}) => {
  const toastContext = useIonToast();
  const presentToast = toastContext[0];
  const dismissToast = toastContext[1];
  // Get the initializeWeb3 function from the Web3 context
  const { initializeWeb3 } = useEthersProvider()
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
      await displayLoader()
      await connect();
      // If connection to the wallet was successful, initialize new Web3 instance
      await initializeWeb3()
      // Hide the loader
      await hideLoader()
    } catch (error:any) {
      // Log any errors that occur during the connection process
      // console.error("handleConnect:", error);
      await presentToast({
        message: `[ERROR] Connect Failed with reason: ${error?.message||error}`,
        color: "danger",
        buttons: [
          { text: 'x', role: 'cancel', handler: () => {
            dismissToast();
          }}
        ]
      });
      // Hide the loader
      await hideLoader();
    }
  }

  // Render the button component with the click event handler
  return <IonButton 
    size={props?.size||'default'} 
    style={props.style||{}} 
    expand={props?.expand||undefined}
    color="gradient"
    onClick={handleConnect}>Connect</IonButton>
}

export default ConnectButton