import {
  IonAccordionGroup,
  IonCol,
  IonGrid,
  IonRow,
  IonSearchbar,
  IonSpinner,
  IonText,
} from "@ionic/react";
import { PoolHeaderList } from "./PoolHeaderList";
import { PoolAccordionGroup } from "./PoolAccordionGroup";
import { useAave } from "../context/AaveContext";
import { useState } from "react";

export function MarketList(props: {
  handleSegmentChange: (e: { detail: { value: string } }) => void;
}) {
  const { handleSegmentChange } = props;
  const { poolGroups, userSummaryAndIncentivesGroup } = useAave();
  const [filterBy, setFilterBy] = useState<{ key: string; value: any } | null>(
    null
  );

  const groups = (poolGroups || []).filter((g) => {
    if (filterBy && filterBy.key && filterBy.value) {
      return g.reserves.find((r: any) =>
        r[filterBy.key]
          .toLocaleLowerCase()
          .includes(filterBy.value.toLocaleLowerCase())
      );
    } else {
      return g;
    }
  });

  return (
    <>
      <IonGrid className="ion-no-padding">
        <IonRow class="ion-justify-content-end">
          <IonCol size="12" size-md="3" class="ion-padding-end">
            <IonSearchbar
              placeholder="WETH, DAI, ..."
              debounce={500}
              onIonInput={(e) => {
                setFilterBy({
                  key: "symbol",
                  value: e.detail.value,
                });
              }}
              style={{
                margin: "0rem auto 1rem",
              }}
            ></IonSearchbar>
          </IonCol>
        </IonRow>
      </IonGrid>
      {groups.length > 0 && (
        <>
          {/* list header */}
          <PoolHeaderList
            titles={[
              "Assets",
              "Networks",
              "Total deposits",
              " Total borrows",
              "Best deposit APY",
              "Best borrow APY",
            ]}
          />
          <IonAccordionGroup>
            {groups.map((poolGroup, index) => (
              <PoolAccordionGroup
                key={index}
                poolGroup={poolGroup}
                userSummaryAndIncentivesGroup={userSummaryAndIncentivesGroup}
                handleSegmentChange={handleSegmentChange}
              />
            ))}
          </IonAccordionGroup>
        </>
      )}
      {groups.length === 0 && (
        <IonGrid class="ion-padding">
          <IonRow class="ion-padding">
            <IonCol size="12" class="ion-text-center">
              <IonText>
                <p>
                  <small>This asset is not available</small>
                </p>
              </IonText>
            </IonCol>
          </IonRow>
        </IonGrid>
      )}
    </>
  );
}
