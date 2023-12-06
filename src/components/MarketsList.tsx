import {
  IonAccordionGroup,
  IonCol,
  IonGrid,
  IonInput,
  IonRow,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonText,
  IonToggle,
} from "@ionic/react";
import { PoolHeaderList } from "./PoolHeaderList";
import { PoolAccordionGroup } from "./PoolAccordionGroup";
import { useAave } from "../context/AaveContext";
import { useState } from "react";
import { CHAIN_AVAILABLES } from "../constants/chains";
import { IReserve } from "../interfaces/reserve.interface";

export function MarketList(props: {
  filterBy?: {
    [key: string]: string;
  };
  handleSegmentChange: (e: { detail: { value: string } }) => void;
}) {
  const { handleSegmentChange, filterBy: filterFromParent } = props;
  const { poolGroups, userSummaryAndIncentivesGroup } = useAave();
  const [filterBy, setFilterBy] = useState<{
    [key: string]: string;
  }|null>(
    (filterFromParent as any)
  );
  const filterArgs = { ...filterFromParent, ...filterBy } ;
  // remove all group from `poolGroup` that not respect all filterBy argument
  // and return only reserve pool that respect all filterBy argument
  const groups = (poolGroups||[])
    .map((group) => {
      const poolGroup = {
        ...group,
        reserves: group.reserves
        .filter(reserve => reserve.isFrozen === false && reserve.isActive === true && reserve.isPaused === false)
        .filter((pool: any) => {
          if (filterArgs) {
            return Object.keys(filterArgs).every((key) => {
              // value string if a boolean value
              if (filterArgs[key] === "true" || filterArgs[key] === "false") {
                  return Boolean(pool[key]);
              }
              // string key type value
              if (typeof pool[key] === "string") {
                return (
                  pool[key] &&
                  pool[key].toLowerCase().includes(filterArgs[key].toLowerCase())
                );
              }
              // Number key type value
              if (typeof pool[key] === "number") {
                return isNaN(Number(filterArgs[key]))
                  ? true
                  : pool[key] === Number(filterArgs[key]);
              }
              return true;
            });
          }
          return true;
        }),
      };
      return poolGroup;
    })
    .filter((group) => group.reserves.length > 0);

  return (
    <>
      <IonGrid className="ion-no-padding ion-padding-vertical">
        <IonRow class="ion-justify-content-between ion-align-items-center"
              style={{
                padding: 0,
                margin: "0rem auto 1rem",
              }}>
          <IonCol size="12" sizeMd="auto" class="ion-padding-horizontal">
            <IonInput 
              label="Symbol" 
              labelPlacement="stacked"
              fill="outline"
              placeholder="WETH, DAI, ..."
              type="search"
              clearInput={true}
              onIonInput={(e) => {
                setFilterBy((s) => ({
                  ...s,
                  "symbol": e.detail.value || "",
                }));
              }}
            ></IonInput>
          </IonCol>
          <IonCol size="12" sizeMd="3" class="ion-padding-horizontal">
            <IonSelect 
              label="Networks" 
              labelPlacement="stacked" 
              aria-label="Network" 
              interface="popover" 
              placeholder="Select network"
              onIonChange={(e) => {
                const chainId = e.detail.value && e.detail.value.length > 0 
                  ? Number(e.detail.value)
                  : null;
                setFilterBy((s) => ({
                  ...s,
                  "chainId": e.detail.value || "*",
                }));
                // if (chainId) {
                //   setFilterBy((s) => ({
                //     ...s,
                //     "chainId": e.detail.value || "*",
                //   }));
                // } else {
                //   // remove chainId from `filterBy`
                //   const { chainId, ...rest } = filterBy || {};
                //   setFilterBy(() => rest);
                // }
              }}
            >
              <IonSelectOption value="*">All</IonSelectOption>
              {CHAIN_AVAILABLES
              .filter(chain => chain.type === 'evm')
              .map((chain, index) => (
                <IonSelectOption key={`option_chainId_${index}`} value={chain.id.toString()}>
                  {chain.name}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonCol>
          <IonCol size="12" sizeMd="3" class="ion-padding-horizontal">
            <IonSelect 
              label="Protocols" 
              labelPlacement="stacked" 
              aria-label="Protocols" 
              interface="popover" 
              placeholder="Select protocol"
              onIonChange={(e) => {
                const name = e.detail.value && e.detail.value.length > 0 
                  ? Number(e.detail.value)
                  : null;
                if (name) {
                  setFilterBy((s) => ({
                    ...s,
                    "protocol": e.detail.value || "",
                  }));
                } else {
                  // remove chainId from `filterBy`
                  const { chainId, ...rest } = filterBy || {};
                  setFilterBy(() => rest);
                }
              }}
            >
              <IonSelectOption value="">All</IonSelectOption>
              <IonSelectOption value="AAVE">AAVE V3</IonSelectOption>
            </IonSelect>
          </IonCol>
          <IonCol size="12" sizeMd="auto" class="ion-padding-horizontal">
            <IonToggle 
              labelPlacement="start"
              aria-label="active"
              justify="end"
              onIonChange={(e) => {
                const checked = e.detail.checked||false; 
                console.log('>>', e);
                if (checked) {
                  setFilterBy((s) => ({
                    ...s,
                    "walletBalance": "true",
                  }));
                }
                else {
                  // remove from `filterBy`
                  const { walletBalance, ...rest } = filterBy || {};
                  setFilterBy(() => rest);
                }
              }}
            >
              Wallet balance only
            </IonToggle>
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
                  <small>No available markets</small>
                </p>
              </IonText>
            </IonCol>
          </IonRow>
        </IonGrid>
      )}
    </>
  );
}
