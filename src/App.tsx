import {
  IonApp,
  IonButton,
  IonChip,
  IonCol,
  IonContent,
  IonFooter,
  IonGrid,
  IonHeader,
  IonIcon,
  IonImg,
  IonItem,
  IonItemDivider,
  IonLabel,
  IonListHeader,
  IonPage,
  IonPopover,
  IonRouterOutlet,
  IonRow,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
  IonText,
  IonToolbar,
} from "@ionic/react";
import { useUser } from "./context/UserContext";
import { useEffect, useMemo, useRef, useState } from "react";
import { setupIonicReact } from "@ionic/react";
import { AaveProvider } from "./context/AaveContext";
import { DefiContainer } from "./components/DefiContainer";
import { Welcome } from "./components/Welcome";
import { Swap } from "./components/Swap";
import { Fiat } from "./components/Fiat";
import { Header } from "./components/Header";
import { Earn } from "./components/Earn";

setupIonicReact({
  mode: "ios",
});


function App() {
  console.log(`[INFO] HexaLite v${process.env.REACT_APP_VERSION}`);
  // get params from url `s=`
  const urlParams = new URLSearchParams(window.location.search);
  let segment = urlParams.get("s") || "welcome";
  // handle unsupported segment
  if (segment && ['welcome', 'swap', 'fiat', 'defi', 'earn'].indexOf(segment) === -1) {
    urlParams.delete('s');
    segment = '';
    // reload window with correct segment
    window.location.href = `${window.location.origin}?${urlParams.toString()}`;
  }
  // use state to handle segment change
  const [currentSegment, setSegment] = useState(segment);
  const handleSegmentChange = (e: any) => {
    setSegment(e.detail.value);
  };
  const contentRef = useRef<HTMLIonContentElement|null>(null);
  const scrollToTop= () => {
    // @ts-ignore
    contentRef.current.scrollToTop();
};

  const renderSwitch = (param: string) => {
    switch (param) {
      case "welcome":
        return <Welcome handleSegmentChange={handleSegmentChange} />;
      case "swap":
        return <Swap />;
      case "fiat":
        return (<Fiat />);
      case "defi":
        return (
          <AaveProvider>
            <DefiContainer handleSegmentChange={handleSegmentChange} />
          </AaveProvider>
        );
      case "earn": {
        return (
          <AaveProvider>
            <Earn />
          </AaveProvider>
        )
      }
      default:
        return currentSegment ?
          (
          <div
            style={{
              textAlign: "center",
            }}
          >
            <IonText color="medium">
              <h1>{currentSegment.toUpperCase()}</h1>
              <p>
                This feature is in development. <br />
                Please check back later.
              </p>
            </IonText>
            <IonChip color="primary">Coming soon</IonChip>
          </div>
        )
        : (<></>)
    }
  };

  return (
    <IonApp>
      <IonRouterOutlet>
        <Header currentSegment={currentSegment} handleSegmentChange={handleSegmentChange} scrollToTop={scrollToTop} />
        <IonContent ref={contentRef} scrollEvents={true} fullscreen={true} className="ion-padding">
          <IonGrid class="ion-no-padding" style={{ minHeight: "95vh" }}>
            <IonRow
              style={{
                minHeight: "100%",
                height: currentSegment !== "welcome" ? "100%" : "90vh",
              }}
              class={
                currentSegment !== "welcome"
                  ? "ion-align-items-top ion-justify-content-center ion-no-padding"
                  : "ion-align-items-center ion-justify-content-center ion-no-padding"
              }
            >
              <IonCol size="12" class="ion-no-padding">
                {renderSwitch(currentSegment)}
                { currentSegment !== "welcome" && (
                  <div style={{
                    position: 'fixed',
                    bottom: '0.5rem',
                    margin: 'auto',
                    width: '100%',
                    left: 0,
                    textAlign: 'center',
                    zIndex: -1,
                    opacity: 0.6
                  }}>
                    <small>
                      {`HexaLite v${process.env.REACT_APP_VERSION}`}
                    </small>
                  </div>
                )}
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonContent>
      </IonRouterOutlet>
    </IonApp>
  );
}

export default App;
