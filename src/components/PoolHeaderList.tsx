import { IonCol, IonGrid, IonLabel, IonRow } from "@ionic/react";

interface IPoolHeaderListProps {
  titles: string[];
  colSize?: string;
}

export function PoolHeaderList(props: IPoolHeaderListProps) {
  const { titles, colSize } = props;

  return (
    <IonGrid>
      <IonRow class="ion-align-items-center ion-justify-content-between">
        {titles.map((title, index) => {
          let Col = <IonCol key={index}>undefined</IonCol>;
          if (index === 0) {
            Col = (
              <IonCol key={index} size-md={colSize ? colSize : '3'} class="ion-padding-start">
                <IonLabel color="medium">
                  <h3>
                    {title}
                  </h3>
                </IonLabel>
              </IonCol>
            );
          } else if (index === 1) {
            Col = (
              <IonCol
                key={index}
                size="auto"
                size-md="1"
                class="ion-text-center ion-hide-md-down"
              >
                <IonLabel color="medium">
                  <h3>{title}</h3>
                </IonLabel>
              </IonCol>
            );
          } else {
            Col = (
              <IonCol 
                key={index} 
                size="auto" 
                size-md="2" 
                class="ion-hide-md-down ion-text-end"
              >
                <IonLabel color="medium">
                  <h3 
                    style={{ 
                      marginRight: (index + 1 === titles.length ) 
                        ? "1.6rem"
                        : "0"
                       }}
                  >
                    {title}
                  </h3>
                </IonLabel>
              </IonCol>
            );
          }
          return Col;
        })}

        {/* <IonCol size-md="3" class="ion-padding-start">
          <IonLabel color="medium">
            <h3>Asset</h3>
          </IonLabel>
        </IonCol>
        <IonCol
          size="auto"
          size-md="1"
          class="ion-text-center ion-hide-md-down"
        >
          <IonLabel color="medium">
            <h3>Protocol</h3>
          </IonLabel>
        </IonCol>
        <IonCol size="auto" size-md="2" class="ion-text-end  ion-hide-md-down">
          <IonLabel color="medium">
            <h3 style={{ marginRight: "0.6rem" }}>Deposits</h3>
          </IonLabel>
        </IonCol>
        <IonCol size="auto" size-md="2" class="ion-text-end  ion-hide-md-down">
          <IonLabel color="medium">
            <h3 style={{ marginRight: "1.2rem" }}>Borrows</h3>
          </IonLabel>
        </IonCol>
        <IonCol size="auto" size-md="2" class="ion-text-end">
          <IonLabel color="medium">
            <h3 style={{ marginRight: "1.8rem" }}>Deposit APY</h3>
          </IonLabel>
        </IonCol>
        <IonCol size="auto" size-md="2" class="ion-text-end ion-hide-sm-down">
          <IonLabel color="medium">
            <h3 style={{ paddingRight: "2rem" }}>Borrow APY</h3>
          </IonLabel>
        </IonCol> */}
      </IonRow>
    </IonGrid>
  );
}
