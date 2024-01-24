import { useWeb3Provider } from "@/context/Web3Context";
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCol, IonGrid, IonIcon, IonNote, IonRow, IonText, useIonAlert, useIonModal, useIonToast } from "@ionic/react";
import { closeSharp } from "ionicons/icons";
import { useEffect } from "react";

const ModalAlertMessageComponent = (props: {walletAddress: string; dismiss: () => void}) => {
  const { walletAddress, dismiss } = props;
  // toasts
  const [present] = useIonToast();

  const copyWalletAddress = () => {
    if (!walletAddress){
      return;
    }
    navigator?.clipboard?.writeText(walletAddress);
    present({
      message: "Wallet Address copied to clipboard",
      duration: 5000,
      color: "gradient",
      buttons: [{ text: "X", handler: () => {} }],
    });
  }
  useEffect(() => {
    copyWalletAddress();
  }, []);

  return (

    <IonGrid className="ion-no-padding">
    <IonRow class="ion-align-items-top ion-padding">
      <IonCol size="10">
        <IonText>
          <h3 style={{ marginBottom: 0 }}>
            <b>
              Important informations
            </b>
          </h3>
        </IonText>
      </IonCol>
      <IonCol size="2" class="ion-text-end">
        <IonButton
          size="small"
          fill="clear"
          onClick={() => {
            dismiss();
          }}
        >
          <IonIcon slot="icon-only" icon={closeSharp}></IonIcon>
        </IonButton>
      </IonCol>
    </IonRow>
    <IonRow class="ion-align-items-center ion-padding-horizontal">
      <IonCol size="12" className="ion-padding-bottom">
        <div>
          <p style={{fontSize: '0.8rem'}}>
            During the purchase process, you will be asked to provide your wallet address and the network.
          </p>
            {walletAddress
              ? (<>
                <p style={{fontSize: '0.8rem'}}>
                  Your wallet address is 
                  <IonText className="ion-color-gradient-text" style={{cursor: 'pointer'}} onClick={()=> copyWalletAddress()}>
                    {walletAddress}
                  </IonText> and the network is <IonText className="ion-color-gradient-text">Optimism</IonText>.</p>
                <p style={{fontSize: '0.8rem'}}>
                  We strongly recommend to purchase <b>ETH</b> with your preferred currency and payement provider. That way you will be able to pay for gas fees when interacting with the dApp and DeFi protocols.
                </p>
                <p style={{fontSize: '0.8rem'}}>Please make sure you select the correct network when purchasing your crypto.</p>
              </>
              )
              : (<p style={{fontSize: '0.8rem'}}>Connect your wallet to get your wallet address.</p>)
            }
        </div>
      </IonCol>
    </IonRow>
  </IonGrid>
  );
}

export function FiatContainer() {
  const { walletAddress } = useWeb3Provider();
  // display Alert to explain how to use wallet address on purchass with fiat. Provider will ask you your wallet address...
  const [present, dismiss] = useIonModal(ModalAlertMessageComponent, {walletAddress, dismiss: () => dismiss()});

  useEffect(() => {
    present({
      cssClass: 'modalAlert autoSize'
    });
  }, []);

  return (
    <IonGrid class="ion-no-padding" style={{ marginBottom: "5rem" }}>
      <IonRow class="ion-justify-content-center">
        <IonCol size="12" class="ion-text-center">
          <IonText>
            <h1>Buy crypto</h1>
          </IonText>
          <IonText color="medium">
            <p
              style={{
                lineHeight: "1.5rem",
              }}
            >
              Use your credit card, Google Pay or Apple Pay to buy crypto
              instantly
            </p>
          </IonText>
        </IonCol>
      </IonRow>
      <IonRow>
        <IonCol size="12">
          <div
            style={{
              paddingTop: "1rem",
              paddingBottom: "10rem",
              textAlign: "center",
            }}
          >
            <iframe
              style={{
                maxWidth: "90vw",
                border: "solid 1px rgba(var(--ion-color-primary-rgb), 0.4)",
                borderRadius: "32px",
                overflow: "hidden",
                display: "inline-block",
              }}
              src="https://buy.onramper.com?themeName=dark&containerColor=1e2843ff&primaryColor=46de8c&secondaryColor=3f3f43&cardColor=2a3b59ff&primaryTextColor=ffffff&secondaryTextColor=ffffff&borderRadius=1.46&wgBorderRadius=1&defaultCrypto=ETH_OPTIMISM"
              title="Onramper Widget"
              height="630px"
              width="450px"
              allow="payment"
            />
          </div>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
}
