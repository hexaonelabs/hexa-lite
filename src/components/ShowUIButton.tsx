import { useEffect, useState } from "react";
import { IonButton, IonSpinner } from "@ionic/react";
import { useWeb3Provider } from "../context/Web3Context";

const ShowUIButton = () => {
  // Initialize state variable to decide whether to show button or not
  const [isLoading, setIsLoading] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const { getInfo } = useWeb3Provider();

  // Define a function to check the type of the wallet
  const checkWalletType = async () => {
    try {
      setIsLoading(true);
      const walletInfo = await getInfo();
      const isMagicProvider = walletInfo?.walletType === "magic";
      if (!isMagicProvider) {
        setIsLoading(false);
        setShowButton(false);
        return;
      }
      // Fetch the wallet's information using Magic's user.getInfo method
      
      ///@ts-ignore
      // Determine if the wallet type is "magic"
      const isMagicWallet = walletInfo.walletType === "magic";

      // Set 'showButton' state based on the result of the check
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
      // await wallet?.showWalletUI();
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
      fill="outline"
      style={{ marginBottom: "0.5rem" }}
      onClick={handleShowUI}
    >
      Wallet overview
    </IonButton>
  ) : null;
};

export default ShowUIButton;
