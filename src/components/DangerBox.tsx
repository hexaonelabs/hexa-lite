import { IonText } from "@ionic/react";

export function DangerBox({ children }: { children?: React.ReactNode }) {

  return (
    <div className="ion-padding" style={{
      background: 'rgba(var(--ion-color-danger-rgb), 0.1)'
    }}>
      <IonText color="danger" style={{fontSize: '14px'}}>
        {children}
      </IonText>
    </div>
  );
}