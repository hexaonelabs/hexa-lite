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

setupIonicReact({
  mode: "ios",
});


function App() {

  // use state to handle segment change
  const [currentSegment, setSegment] = useState("welcome");
  const handleSegmentChange = (e: any) => {
    setSegment(e.detail.value);
  };

  const renderSwitch = (param: string) => {
    switch (param) {
      case "welcome":
        return <Welcome handleSegmentChange={handleSegmentChange} />;
      case "swap":
        return <Swap></Swap>;
      case "fiat":
        return (<Fiat></Fiat>);
      case "defi":
        return (
          <AaveProvider>
            <DefiContainer></DefiContainer>
          </AaveProvider>
        );
      default:
        return (
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
        );
    }
  };

  return (
    <IonApp>
      <IonRouterOutlet>
        <Header currentSegment={currentSegment} handleSegmentChange={handleSegmentChange} />
        <IonContent fullscreen={true} className="ion-padding">
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
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonContent>
      </IonRouterOutlet>
    </IonApp>
  );
}

export default App;
