import { useEffect, useState } from "react";
import { IonButton, IonSpinner } from "@ionic/react";
import { getMagic } from "@/servcies/magic";

const ShowUIButton = () => {
  // Initialize state variable to decide whether to show button or not
  const [isLoading, setIsLoading] = useState(false);
  const [showButton, setShowButton] = useState(false);
  // Define a function to check the type of the wallet
  const checkWalletType = async () => {
    const magic = await getMagic();
    try {
      setIsLoading(true);
      const isMagicProvider = magic.rpcProvider.isMagic;
      if (!isMagicProvider) {
        setIsLoading(false);
        setShowButton(false);
        return;
      }
      // Fetch the wallet's information using Magic's user.getInfo method
      
      ///@ts-ignore
      // Determine if the wallet type is "magic"
      // Set 'showButton' state based on the result of the check
      const isMagicWallet = (await magic.wallet.getInfo())?.walletType === "magic";
      setIsLoading(false);
      setShowButton(isMagicWallet);
    } catch (error) {
      // Log any errors that occur during the wallet type check process
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Call the checkWalletType function
    checkWalletType();
    return () => {};
  }, []);

  // Define the event handler for the button click
  const handleShowUI = async () => {
    try {
      // Try to show the magic wallet user interface
      const magic = await getMagic();
      await magic.wallet.showUI();
      throw new Error("Not implemented");
    } catch (error) {
      // Log any errors that occur during the process
      console.error("handleShowUI:", error);
    }
  };

  // Render the button component if showButton is true, otherwise render nothing
  return isLoading ? (
    <IonSpinner name="dots" />
  ) : showButton ? (
    <IonButton
      expand="block"
      fill="clear"
      size="small"
      style={{ marginBottom: "0.5rem" }}
      onClick={handleShowUI}
    >
      Wallet overview
    </IonButton>
  ) : null;
};

export default ShowUIButton;
