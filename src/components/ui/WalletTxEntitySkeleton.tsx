import React from "react";
import {
  IonGrid,
  IonRow,
  IonCol,
  IonItem,
  IonAvatar,
  IonSkeletonText,
  IonLabel,
  IonText,
} from "@ionic/react";

interface Props {
  itemCounts?: number;
}

export const WalletTxEntitySkeleton: React.FC<Props> = ({ itemCounts }) => {
  return (
    <IonGrid class="ion-no-padding" style={{ width: "100%" }}>
      <IonRow class="ion-no-padding">
        <IonCol size="12" class="ion-text-center ion-no-padding">
          {/* Skeleton item */}
          {Array.from({ length: itemCounts ? itemCounts : 5 }).map(
            (_, index) => (
              <IonItem
                key={index}
                style={{
                  "--background": "transparent",
                  "--padding-start": "0",
                  "--inner-padding-start": "16px",
                  borderTop:
                    index === 0 ? "solid var(--ion-border-color) 1px" : "none",
                }}
              >
                <IonGrid className="ion-no-padding">
                  <IonRow className="ion-align-items-center ion-justify-content-between ion-padding-vertical">
                    <IonCol
                      size-xs="1"
                      size-sm="1"
                      size-md="2"
                      size-lg="2"
                      size-xl="2"
                      className="ion-align-self-center ion-text-wrap flex ion-align-items-center ion-padding-end"
                    >
                      <div className="ion-padding-end">
                        <IonAvatar
                          style={{
                            bottom: "0",
                            right: "0",
                            width: "46px",
                            height: "46px",
                            minWidth: "46px",
                            minHeight: "46px",
                          }}
                        >
                          <IonSkeletonText animated style={{ width: "100%" }} />
                        </IonAvatar>
                      </div>
                      <IonSkeletonText animated style={{ width: "100%" }} />
                    </IonCol>

                    <IonCol>
                      <div className="flex ion-align-items-center ion-margin-end">
                        <IonAvatar
                          className="ion-margin-end"
                          style={{
                            maxWidth: "24px",
                            maxHeight: "24px",
                          }}
                        >
                          <IonSkeletonText animated style={{ width: "100%" }} />
                        </IonAvatar>
                        <IonSkeletonText
                          animated
                          style={{ width: "100%", maxWidth: "100px" }}
                        />
                      </div>
                    </IonCol>

                    <IonCol size="2" className="ion-text-end ion-padding-end">
                      <div className="ion-margin-end">
                        <IonSkeletonText animated style={{ width: "100%" }} />
                      </div>
                    </IonCol>

                    <IonCol size="1" className="ion-text-end ion-padding-end">
                      <div className="ion-margin-start">
                        <IonSkeletonText animated style={{ width: "100%" }} />
                      </div>
                    </IonCol>
                  </IonRow>
                </IonGrid>
              </IonItem>
            )
          )}
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};
