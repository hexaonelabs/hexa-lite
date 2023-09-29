import { IonText } from "@ionic/react";

export function WarningBox({ children }: { children?: React.ReactNode }) {

  return (
    <div className="ion-padding ion-margin" style={{
      background: 'rgba(var(--ion-color-warning-rgb), 0.1)'
    }}>
      <IonText color="warning" style={{fontSize: '14px'}}>
        {children}
      </IonText>
    </div>
  );
}