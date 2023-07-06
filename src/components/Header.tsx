import {
  IonButton,
  IonChip,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonImg,
  IonItem,
  IonItemDivider,
  IonLabel,
  IonListHeader,
  IonPopover,
  IonRow,
  IonSegment,
  IonSegmentButton,
  IonText,
  IonToolbar,
} from "@ionic/react";
import { ellipsisVerticalSharp, logoGithub } from "ionicons/icons";
import { AuthBadge } from "./AuthBadge";
import ConnectButton from "./ConnectButton";
import DisconnectButton from "./DisconnectButton";
import { useUser } from "../context/UserContext";
import { useRef } from "react";
import { MenuPopover } from "./MenuPopover";

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
  handleSegmentChange,
}: {
  currentSegment: string;
  handleSegmentChange: (e: { detail: { value: string } }) => void;
}) {
  // define states
  const popoverRef = useRef<HTMLIonPopoverElement>(null);
  const { user } = useUser();

  // render component
  return (
    <IonHeader translucent={true} class="ion-no-border">
      <IonToolbar style={{ "--background": "transparent" }}>
        <IonGrid class="ion-no-padding">
          <IonRow class="ion-align-items-center ion-justify-content-between">
            {currentSegment === "welcome" ? (
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
                  {/* <IonIcon icon={'./assets/images/logo.svg'} style={styleLogo} /> */}
                  <IonChip style={styleChip}>beta</IonChip>
                </div>
              </IonCol>
              <IonCol size="auto" style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
              }} class="ion-padding ion-hide-md-down">
                <IonSegment
                  style={{ maxWidth: "550px" }}
                  mode="ios"
                  value={currentSegment}
                  onIonChange={(e: any) => handleSegmentChange(e)}
                >
                  <IonSegmentButton value="swap">Exchange</IonSegmentButton>
                  <IonSegmentButton value="defi">
                    Lending & Borrow
                  </IonSegmentButton>
                  <IonSegmentButton value="stacking">
                    Earn Interest
                  </IonSegmentButton>
                  <IonSegmentButton value="fiat">Buy</IonSegmentButton>
                </IonSegment>
              </IonCol>
              <IonCol
                size="auto"
                class="ion-padding ion-text-end ion-hide-md-down"
              >
                <AuthBadge user={user} />
              </IonCol>
              {/* Mobile nav button */}
              <IonCol size="auto" class="ion-padding ion-hide-md-up">
                <IonButton fill="clear" color="primary" id="click-trigger">
                  <IonIcon slot="icon-only" icon={ellipsisVerticalSharp} />
                </IonButton>
                {/* Popover wiith options */}
                <IonPopover
                  ref={popoverRef}
                  trigger="click-trigger"
                  triggerAction="click"
                >
                  <MenuPopover 
                    popoverRef={popoverRef}
                    handleSegmentChange={handleSegmentChange} />
                </IonPopover>
              </IonCol>
            </>
            )}

            {/* <IonCol size="12">{AuthButton}</IonCol> */}
            {/* <IonCol size="12">{WalletInfo}</IonCol> */}
          </IonRow>
        </IonGrid>
      </IonToolbar>
    </IonHeader>
  );
}
