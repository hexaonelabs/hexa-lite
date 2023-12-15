import {
  IonButton,
  IonChip,
  IonCol,
  IonGrid,
  IonHeader,
  IonIcon,
  IonImg,
  IonMenuToggle,
  IonPopover,
  IonRow,
  IonSegment,
  IonSegmentButton,
  IonToolbar,
} from "@ionic/react";
import { ellipsisVerticalSharp, radioButtonOn } from "ionicons/icons";
import { AuthBadge } from "./AuthBadge";
import ConnectButton from "./ConnectButton";
import { useEffect } from "react";
import { getSplitedAddress } from "../utils/getSplitedAddress";
import { useWeb3Provider } from "../context/Web3Context";

const styleLogo = {
  // margin: '15px auto 20px',
  padding: " 0px",
  width: "42px",
  maxWidth: "42px",
  height: "42px",
  cursor: "pointer",
};

const styleChip = {
  position: "absolute",
  bottom: "0rem",
  right: "-15px",
  transform: "scale(0.6)",
  padding: " 0rem 0.5rem",
  margin: 0,
  "--color": "var(--ion-color-primary)",
  "--background": "var(--ion-color-warning)",
};

export function Header({
  currentSegment,
  scrollToTop,
  handleSegmentChange,
}: {
  currentSegment: string;
  scrollToTop: () => void;
  handleSegmentChange: (e: { detail: { value: string } }) => void;
}) {
  // define states
  const { walletAddress } = useWeb3Provider();
  console.log("walletAddress", walletAddress);
  
  useEffect(() => {
    scrollToTop();
  }, [currentSegment]);
  // render component
  return (
    <IonHeader translucent={true} class="ion-no-border">
      <IonToolbar style={{ "--background": "transparent" }}>
        <IonGrid class="ion-no-padding">
          <IonRow class="ion-align-items-center ion-justify-content-between">
            {!currentSegment || currentSegment === "welcome" ? (
              <></>
            ) : (
              <>
                <IonCol size="auto" class="ion-padding ion-text-start">
                  <div
                    onClick={() =>
                      handleSegmentChange({ detail: { value: "welcome" } })
                    }
                    style={{
                      position: "relative",
                      display: "inline-block",
                    }}
                  >
                    <IonImg
                      style={styleLogo}
                      src={"./assets/images/logo.svg"}
                    ></IonImg>
                    <IonChip style={styleChip}>beta</IonChip>
                  </div>
                </IonCol>
                <IonCol
                  size="auto"
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                  class="ion-padding ion-hide-md-down"
                >
                  <IonSegment
                    style={{ maxWidth: "550px" }}
                    mode="ios"
                    value={currentSegment}
                    onIonChange={(e: any) => handleSegmentChange(e)}
                  >
                    <IonSegmentButton value="swap">
                      Exchange
                    </IonSegmentButton>
                    <IonSegmentButton value="earn">
                      Earn Interest
                    </IonSegmentButton>
                    <IonSegmentButton value="defi">
                      Lending & Borrow
                    </IonSegmentButton>
                    <IonSegmentButton value="fiat">
                      Buy
                    </IonSegmentButton>
                  </IonSegment>
                </IonCol>
                <IonCol
                  size="auto"
                  class="ion-padding ion-text-end ion-hide-md-down"
                >
                  {walletAddress ? (
                    <>
                      <IonButton
                        id="badge-auth"
                        size={"default"}
                        style={{ cursor: "pointer" }}
                        color="gradient"
                        expand={"block"}
                      >
                        <IonIcon 
                          color="success" 
                          className="connectedIcon" 
                          src={radioButtonOn}></IonIcon>
                        Connected
                      </IonButton>
                      <IonPopover trigger="badge-auth">
                        <AuthBadge />
                      </IonPopover>
                    </>
                  ) : (
                    <ConnectButton />
                  )}
                </IonCol>
                {/* Mobile nav button */}
                <IonCol size="auto" class="ion-padding ion-hide-md-up">
                  <IonMenuToggle>
                    <IonButton fill="clear" color="primary" id="click-trigger">
                      <IonIcon slot="icon-only" src={ellipsisVerticalSharp} />
                    </IonButton>
                  </IonMenuToggle>
                </IonCol>
              </>
            )}
          </IonRow>
        </IonGrid>
      </IonToolbar>
    </IonHeader>
  );
}
