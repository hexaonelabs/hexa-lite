import { IonApp, IonButton, IonRouterOutlet, setupIonicReact, IonText, IonChip, IonContent, IonGrid, IonRow, IonCol, IonPage } from '@ionic/react';


export const NotFoundPage: React.FC = () => {
  return (
    <IonPage>
      <IonContent className="ion-padding ion-text-center">
        <IonText>
          <h1>404 - Page Not Found</h1>
        </IonText>
      </IonContent>
    </IonPage>
  );
}