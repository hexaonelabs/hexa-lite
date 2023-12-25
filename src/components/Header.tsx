import {
  IonButton,
  IonChip,
  IonCol,
  IonGrid,
  IonHeader,
  IonIcon,
  IonImg,
  IonLabel,
  IonListHeader,
  IonMenuToggle,
  IonPopover,
  IonRow,
  IonSegment,
  IonSegmentButton,
  IonSkeletonText,
  IonSpinner,
  IonText,
  IonToolbar,
} from "@ionic/react";
import {
  ellipsisVerticalSharp,
  radioButtonOn,
  ribbonOutline,
} from "ionicons/icons";
import { AuthBadge } from "./AuthBadge";
import ConnectButton from "./ConnectButton";
import { useEffect, useState } from "react";
import { useWeb3Provider } from "../context/Web3Context";
import { getReadableValue } from "@/utils/getReadableValue";
import { getAddressPoints } from "@/servcies/datas.service";

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


const PointsValueComponent: React.FC<{ points: string | null }> = ({ points }) => {
  return points === null ? (
    <IonSkeletonText
      animated
      style={{
        width: "34px",
        display: "inline-block",
      }}
    />
  ) : (
    <IonText className="ion-color-gradient-text">
      {getReadableValue(points)}
    </IonText>
  );
};

const PointsPopover: React.FC<{ points: string | null }> = ({ points }) => {
  return (<IonGrid>
    <IonRow>
      <IonCol>
        <IonListHeader>
          <IonLabel>Points</IonLabel>
        </IonListHeader>
        <p className="ion-margin-horizontal">
          You have <PointsValueComponent points={points} />{" "}
          points.
        </p>
        <p  className="ion-margin-horizontal">
        <IonText color="medium">
            <small>
            Points are earned by using the app. 
            They are used to rank users on the leaderboard.
            </small>
          </IonText>
        </p>
      </IonCol>
    </IonRow>
    {/* Leaderboard link */}
    <IonRow>
      <IonCol>
        <IonButton
          color="gradient"
          expand="block"
          fill="clear"
          size="small"
          routerLink="/leaderboard"
          routerDirection="forward"
        >
          view leaderboard
        </IonButton>
      </IonCol>
    </IonRow>
  </IonGrid>)
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
  const [points, setPoints] = useState<string | null>(null);
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
                    <IonSegmentButton value="swap">Exchange</IonSegmentButton>
                    <IonSegmentButton value="earn">
                      Earn Interest
                    </IonSegmentButton>
                    <IonSegmentButton value="defi">
                      Lending & Borrow
                    </IonSegmentButton>
                    <IonSegmentButton value="fiat">Buy</IonSegmentButton>
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
                          id="points-btn"
                          fill="clear"
                          color="gradient"
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
                          trigger="points-btn"
                          className="points-popover"
                          onDidDismiss={() => setPoints(() => null)}
                          onWillPresent={async () => {
                            const response =
                              await getAddressPoints(walletAddress)
                              .catch((error) => {});
                            if (response?.data?.totalPoints) {
                              setPoints(() => response.data.totalPoints);
                            } else {
                              setPoints(() => "0");
                            }
                          }}
                        >
                          <PointsPopover points={points} />
                        </IonPopover>
                      </div>
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
