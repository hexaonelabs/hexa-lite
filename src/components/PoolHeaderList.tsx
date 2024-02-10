import { IonCol, IonGrid, IonIcon, IonLabel, IonRow } from "@ionic/react";
import { chevronExpandSharp } from 'ionicons/icons';

interface IPoolHeaderListProps {
  titles: string[];
  colSize?: string;
  handleEvent: (action: {
    type: string,
    payload?: any
  })=> void;
}
export function PoolHeaderList(props: IPoolHeaderListProps) {
  const { titles, colSize } = props;

  return (
    <IonGrid className="poolHeaderList ion-hide-md-down">
      <IonRow class="ion-align-items-center ion-justify-content-between">
        {titles.map((title, index) => {
          let Col = <IonCol key={index}>undefined</IonCol>;
          if (index === 0) {
            Col = (
              <IonCol key={index} size-md={colSize ? colSize : '3'} class="ion-padding-start">
                <IonLabel onClick={()=> props.handleEvent({
                  type: 'sort',
                  payload: 'symbol'
                })}>
                  <h3>
                    {title}
                    <IonIcon style={{
                      fontSize: '0.6rem',
                      marginLeft: '0.25rem',
                      display: 'inline-block',
                      cursor: 'pointer'
                    }} icon={chevronExpandSharp} />
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
                <IonLabel>
                  <h3>
                    {title}
                  </h3>
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
                onClick={()=> props.handleEvent({
                  type: 'sort',
                  payload: title
                })}
              >
                <IonLabel>
                  <h3 
                    style={{ 
                      cursor: 'pointer',
                      marginRight: (index + 1 === titles.length ) 
                        ? "1.6rem"
                        : "0"
                       }}
                  >
                    {title}
                    <IonIcon style={{
                      fontSize: '0.6rem',
                      marginLeft: '0.25rem',
                      display: 'inline-block',
                      cursor: 'pointer'
                    }} icon={chevronExpandSharp} />
                  </h3>
                </IonLabel>
              </IonCol>
            );
          }
          return Col;
        })}
      </IonRow>
    </IonGrid>
  );
}
