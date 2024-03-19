import {
  IonButton,
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
  IonText,
  IonToolbar,
  useIonRouter,
} from "@ionic/react";
import {
  ellipsisVerticalSharp,
  radioButtonOn,
  ribbonOutline,
} from "ionicons/icons";
import { AuthBadge } from "./AuthBadge";
import ConnectButton from "./ConnectButton";
import { useEffect, useState } from "react";
import { getAddressPoints } from "@/servcies/datas.service";
import { PointsPopover } from "./PointsPopover";
import { useRef } from "react";
import { getWeb3State } from "@/store/selectors";
import Store from "@/store";
import { Link } from "react-router-dom";

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
  // scrollToTop,
  handleSegmentChange,
}: {
  currentSegment: string;
  // scrollToTop: () => void;
  handleSegmentChange: (e: { detail: { value: string } }) => void;
}) {
  // define states
  const { walletAddress } = Store.useState(getWeb3State);
  const [points, setPoints] = useState<string | null>(null);
  const [isPointsPopoverOpen, setIsPointsPopoverOpen] = useState(false);
  const pointsPopoverRef = useRef<HTMLIonPopoverElement>(null);
  const router = useIonRouter();
  const openPopover = (e: any) => {
    pointsPopoverRef.current!.event = e;
    setIsPointsPopoverOpen(true);
  };
  useEffect(() => {
    // scrollToTop();
  }, [currentSegment]);

  // render component
  return (
    <IonHeader translucent={true} class="ion-no-border">
      <IonToolbar style={{ "--background": "transparent" }}>
        <IonGrid class="ion-no-padding">
          <IonRow class="ion-align-items-center ion-justify-content-between">
            {!currentSegment || currentSegment === "welcome" ? (
              <>{currentSegment}</>
            ) : (
              <>
                <IonCol size="auto" class="ion-padding ion-text-start">
                  <Link 
                    to="/index" 
                    style={{
                      position: "relative",
                      display: "inline-block",
                    }}>
                    <IonImg
                      style={styleLogo}
                      src={"./assets/images/logo.svg"}
                    ></IonImg>
                  </Link>
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
                    onIonChange={(e: any) => {
                      if (e.detail.value === 'fiat-segment') {
                        handleSegmentChange({detail: {value: 'fiat'}});
                        return;
                      };
                      router.push(`/${e.detail.value}`)
                      handleSegmentChange(e);
                    }}
                  >
                    <IonSegmentButton value="wallet">Wallet</IonSegmentButton>
                    <IonSegmentButton value="swap">Exchange</IonSegmentButton>
                    <IonSegmentButton value="earn">
                      Earn interest
                    </IonSegmentButton>
                    <IonSegmentButton value="defi">
                      Lend & borrow
                    </IonSegmentButton>
                    <IonSegmentButton value="fiat-segment">
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
                      <div style={{ display: "flex" }}>
                        <IonButton
                          fill="clear"
                          color="gradient"
                          style={{ cursor: "pointer" }}
                          size={"small"}
                          onClick={(e) => openPopover(e)}
                        >
                          <IonIcon
                            color="gradient"
                            size="small"
                            style={{ marginRight: "0.25rem" }}
                            src={ribbonOutline}
                          ></IonIcon>
                          <IonText className="ion-color-gradient-text">
                            Points
                          </IonText>
                        </IonButton>
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
                            src={radioButtonOn}
                          ></IonIcon>
                          Connected
                        </IonButton>
                        <IonPopover trigger="badge-auth">
                          <AuthBadge />
                        </IonPopover>
                        <IonPopover
                          ref={pointsPopoverRef}
                          className="points-popover"
                          isOpen={isPointsPopoverOpen}
                          onDidDismiss={() => {
                            setPoints(() => null);
                            setIsPointsPopoverOpen(false);
                          }}
                          onWillPresent={async () => {
                            const response = await getAddressPoints(
                              walletAddress
                            ).catch((error) => {});
                            console.log("response", response);
                            if (response?.data?.totalPoints) {
                              setPoints(() => response.data.totalPoints);
                            } else {
                              setPoints(() => "0");
                            }
                          }}
                        >
                          <PointsPopover
                            points={points}
                            closePopover={() => setIsPointsPopoverOpen(false)}
                          />
                        </IonPopover>
                      </div>
                    </>
                  ) : (
                    <div style={{ display: "flex" }}>
                      <IonButton
                        fill="clear"
                        color="gradient"
                        disabled={true}
                        style={{ cursor: "pointer" }}
                        size={"small"}
                      >
                        <IonIcon
                          color="gradient"
                          size="small"
                          style={{ marginRight: "0.25rem" }}
                          src={ribbonOutline}
                        ></IonIcon>
                        <IonText className="ion-color-gradient-text">
                          Points
                        </IonText>
                      </IonButton>
                      <ConnectButton />
                    </div>
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
