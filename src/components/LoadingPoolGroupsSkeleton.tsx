import React from "react";
import {
  IonGrid,
  IonRow,
  IonCol,
  IonItem,
  IonAvatar,
  IonSkeletonText,
  IonLabel,
} from "@ionic/react";

interface LoadingSkeletonsProps {
  itemCounts?: number;
}

export const LoadingPoolGroupsSkeleton: React.FC<LoadingSkeletonsProps> = ({
  itemCounts,
}) => {
 
  return (<IonGrid class="ion-no-padding" style={{width: '100%'}}>
      <IonRow class="ion-no-padding">
        <IonCol size="12" class="ion-text-center ion-no-padding">
          {/* Skeleton item */}
          {Array.from({ length: itemCounts ? itemCounts : 5 }).map((_, index) => (
            <IonItem
              key={index}
              style={{
                "--background": "transparent",
                "--padding-start": "0",
                "--inner-padding-start": "16px",
                "borderTop": index === 0 ? "solid var(--ion-border-color) 1px" : "none",
              }}
            >
              <IonGrid className="ion-padding-vertical">
                <IonRow class="ion-align-items-center ion-justify-content-between">
                  <IonCol
                    size-md="3"
                    class="ion-text-start"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      alignContent: "center",
                    }}
                  >
                    <IonAvatar
                      style={{
                        height: "64px",
                        width: "64px",
                        minHeight: "64px",
                        minWidth: "64px",
                      }}
                    >
                      <IonSkeletonText animated style={{ width: "100%" }} />
                    </IonAvatar>
                    <IonLabel
                      class="ion-padding-start"
                      style={{ fontSize: "1.2rem" }}
                    >
                      <IonSkeletonText animated style={{ width: "50%" }} />
                      <p>
                        <small>
                          <IonSkeletonText
                            animated
                            style={{ width: "40%" }}
                          />
                        </small>
                      </p>
                    </IonLabel>
                  </IonCol>
                  <IonCol size="1" class="ion-text-center">
                    <IonAvatar
                      style={{
                        height: "16px",
                        width: "16px",
                        minHeight: "16px",
                        minWidth: "16px",
                        margin: "auto",
                      }}
                    >
                      <IonSkeletonText
                        animated
                        style={{ width: "100%", height: "100%" }}
                      />
                    </IonAvatar>
                  </IonCol>
                  <IonCol size-md="2" class="ion-text-end ion-hide-md-down">
                    <IonLabel
                      class="ion-padding-start"
                      style={{ fontSize: "1.2rem" }}
                    >
                      <IonSkeletonText animated style={{ width: "80%" }} />
                    </IonLabel>
                  </IonCol>
                  <IonCol size-md="2" class="ion-text-end ion-hide-md-down">
                    <IonLabel
                      class="ion-padding-start"
                      style={{ fontSize: "1.2rem" }}
                    >
                      <IonSkeletonText animated style={{ width: "80%" }} />
                    </IonLabel>
                  </IonCol>
                  <IonCol size-md="2" class="ion-text-end ion-hide-md-down">
                    <IonLabel
                      class="ion-padding-start"
                      style={{ fontSize: "1.2rem" }}
                    >
                      <IonSkeletonText animated style={{ width: "80%" }} />
                    </IonLabel>
                  </IonCol>
                  <IonCol size-md="2" class="ion-text-end ion-hide-md-down">
                    <IonLabel
                      class="ion-padding-start"
                      style={{ fontSize: "1.2rem" }}
                    >
                      <IonSkeletonText animated style={{ width: "80%" }} />
                    </IonLabel>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </IonItem>
          ))}
        </IonCol>
      </IonRow>
    </IonGrid>)
};

