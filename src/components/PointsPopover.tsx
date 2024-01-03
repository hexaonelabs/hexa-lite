import { getReadableValue } from "@/utils/getReadableValue";
import { IonButton, IonCol, IonGrid, IonLabel, IonListHeader, IonRow, IonSkeletonText, IonText } from "@ionic/react";

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

export const PointsPopover: React.FC<{ 
  points: string | null;
  closePopover?: () => void;
 }> = ({ points, closePopover }) => {
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
          onClick={() => closePopover?.()}
        >
          view leaderboard
        </IonButton>
      </IonCol>
    </IonRow>
  </IonGrid>)
};