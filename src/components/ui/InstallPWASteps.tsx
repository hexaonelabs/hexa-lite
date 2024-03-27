import { IonButton, IonCol, IonGrid, IonRow, IonText, isPlatform } from "@ionic/react";

export const InstallPWASteps = (props: {
  setIsInstallModalOpen: (state: boolean)=> void;
}) => {

  return (
    <>
        <IonGrid className="ion-padding">
          <IonRow>
            <IonCol size="12">
              <p>
                <b>
                  Install to enable all features!
                </b><br/>
                <IonText color="medium">
                <small>Earn strategies, loans market, send, deposit and buy crypto with fiat.</small>
                </IonText>
              </p>
              <ul className="baseList">
                {isPlatform('ios') && (
                  <>
                    <li>Tap the Share button at the bottom of the browser</li>
                    <li>Scroll down and select "Add to Home Screen."</li>
                    <li>Tap "Add" in the top right corner</li>
                  </>
                )}
                {!isPlatform('ios') && (
                  <>
                    <li>Tap the menu button (three dots) in your browserr</li>
                    <li>Select "Add to Home Screen" or "Install App."</li>
                  </>
                )}
              </ul>
              <p>
                Enjoy instant access to our app with a single tap!
              </p>
            </IonCol>
            <IonCol size="12">
              <IonButton 
                className="ion-margin-top" 
                fill="outline" 
                expand="block" 
                color="primary"
                onClick={()=> props.setIsInstallModalOpen(false)}>ok</IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
    </>
  );
}