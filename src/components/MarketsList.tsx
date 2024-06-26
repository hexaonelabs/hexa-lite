import {
  IonAccordionGroup,
  IonCol,
  IonGrid,
  IonInfiniteScroll,
  IonInput,
  IonRow,
  IonSelect,
  IonSelectOption,
  IonText,
  IonToggle,
} from "@ionic/react";
import { PoolHeaderList } from "./PoolHeaderList";
import { PoolAccordionGroup } from "./PoolAccordionGroup";
import { useState } from "react";
import { CHAIN_AVAILABLES } from "../constants/chains";
import { IPoolGroup } from "../interfaces/reserve.interface";
import Store from "@/store";
import { getTotalTVLState, getWeb3State, getPoolGroupsState } from "@/store/selectors";
import { getPoolWalletBalance } from "@/utils/getPoolWalletBalance";
import { LoadingPoolGroupsSkeleton } from "./LoadingPoolGroupsSkeleton";

export function MarketList(props: {
  totalTVL: number;
  filterBy?: {
    [key: string]: string;
  };
  handleSegmentChange: (e: { detail: { value: string } }) => void;
}) {
  const { handleSegmentChange, filterBy: filterFromParent, totalTVL } = props;
  const poolGroups = Store.useState(getPoolGroupsState);
  const { assets } = Store.useState(getWeb3State);
  const [maxItemCount, setMaxItemCount] = useState(10);
  const [filterBy, setFilterBy] = useState<{
    [key: string]: string;
  }|null>(
    (filterFromParent as any)
  );
  // sort state
  const [sortBy, setSortBy] = useState<Partial<Record<keyof IPoolGroup, "asc" | "desc">> | null>(null);
  const filterArgs = { ...filterFromParent, ...filterBy } ;
  // remove all group from `poolGroup` that not respect all filterBy argument
  // and return only pool that respect all filterBy argument
  const groups = poolGroups
    .map((group) => {
      const poolGroup = {
        ...group,
        pools: group.pools
        .filter(pool => pool.isFrozen === false && pool.isActive === true && pool.isPaused === false)
        .filter((pool: any) => {
          if (filterArgs) {
            return Object.keys(filterArgs).every((key) => {
              // filter for assets balance
              if (key === "walletBalance") {
                const balance = getPoolWalletBalance(pool, assets);
                return Boolean(balance);
              }
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
    .filter((group) => group.pools.length > 0)
    .sort((a: any, b: any) => {
      // use state to sort
      if (sortBy) {
        const [key, order] = Object.entries(sortBy)[0];
        if (order === "asc") {
          return a[key] > b[key] ? 1 : -1;
        }
        return a[key] < b[key] ? 1 : -1;
      }
      // default do not sort
      return 0;
    })
    .slice(0, maxItemCount);

  return (
    <>
      <IonGrid 
          className="ion-no-padding ion-padding-vertical" 
          style={{
            position: 'sticky',
            'top': '-1px',
            'background':' var(--ion-background-color)',
            zIndex: 1
          }}>
        <IonRow class="ion-justify-content-between ion-align-items-center marketFilters"
              style={{
                padding: 0,
                margin: "0rem auto 1rem",
              }}>
          <IonCol size="12" sizeMd="3" class="ion-padding-horizontal">
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
          <IonCol size="12" sizeMd="3" class="ion-padding-horizontal ion-hide-md-down">
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
              .filter(chain => chain.type === 'evm' || chain.type === 'solana')
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((chain, index) => (
                <IonSelectOption key={`option_chainId_${index}`} value={chain.id.toString()}>
                  {chain.name}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonCol>
          <IonCol size="12" sizeMd="3" class="ion-padding-horizontal ion-hide-md-down">
            <IonSelect 
              label="Protocols" 
              labelPlacement="stacked" 
              aria-label="Protocols" 
              interface="popover" 
              placeholder="Select protocol"
              onIonChange={(e) => {
                const name = e.detail.value && e.detail.value.length > 0 
                  ? e.detail.value
                  : null;
                console.log(name)
                if (name) {
                  setFilterBy((s) => ({
                    ...s,
                    "provider": e.detail.value || "",
                  }));
                } else {
                  // remove provider from `filterBy`
                  const { provider, ...rest } = filterBy || {};
                  setFilterBy(() => rest);
                }
              }}
            >
              <IonSelectOption value="">All</IonSelectOption>
              <IonSelectOption value="aave-v3">AAVE v3</IonSelectOption>
              <IonSelectOption value="solend">Solend</IonSelectOption>
            </IonSelect>
          </IonCol>
          <IonCol size="12" sizeMd="3" class="ion-padding-horizontal ion-text-end ion-hide-md-down">
            <IonToggle 
              labelPlacement="start"
              aria-label="active"
              justify="end"
              onIonChange={(e) => {
                const checked = e.detail.checked||false; 
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
      {groups.length > 0 && totalTVL && (
        <>
          <PoolHeaderList
            titles={[
              "Assets",
              "Networks",
              "Total deposits",
              "Total borrows",
              "Best deposit APY",
              "Best borrow APY",
            ]}
            handleEvent={(e) => {
              const { payload } = e;
              switch (true) {
                case payload === "Total deposits":
                  setSortBy((s) => ({
                    'totalSupplyBalance': s?.totalSupplyBalance === 'asc' ? 'desc' : 'asc'
                  }));
                  break;
                case payload === "Total borrows":
                  setSortBy((s) => ({
                    'totalBorrowBalance': s?.totalBorrowBalance === 'asc' ? 'desc' : 'asc'
                  }));
                  break;
                case payload === "Best deposit APY":
                  setSortBy((s) => ({
                    'topSupplyApy': s?.topSupplyApy === 'asc' ? 'desc' : 'asc'
                  }));
                  break;
                case payload === "Best borrow APY":
                  setSortBy((s) => ({
                    'topBorrowApy': s?.topBorrowApy === 'asc' ? 'desc' : 'asc'
                  }));
                  break;
              }
            }}
          />
          <IonAccordionGroup style={{minHeight: '80vh'}}>
            {groups.map((poolGroup, index) => (
              <PoolAccordionGroup
                key={index}
                poolGroup={poolGroup}
                handleSegmentChange={handleSegmentChange}
              />
            ))}
          </IonAccordionGroup>
          <IonInfiniteScroll
            threshold="25%"
            onIonInfinite={(ev) => {
              if (maxItemCount >= poolGroups.length) {
                ev.target.disabled = true;
                ev.target.complete();
                return;
              }
              setMaxItemCount((s) => s + 10);
              setTimeout(() => ev.target.complete(), 150);
            }}
          >
            <div className="infinite-scroll-content">
              <LoadingPoolGroupsSkeleton itemCounts={groups.length - maxItemCount > 10 ? 5 : groups.length - maxItemCount} />
            </div>
          </IonInfiniteScroll>
        </>
      )} 
      {poolGroups.length <= 0 && (!totalTVL) && (
        <LoadingPoolGroupsSkeleton itemCounts={5} />
      )}
      {groups.length === 0 && totalTVL && (
        <IonGrid class="ion-padding" style={{minHeight: '80vh'}}>
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
