import {
  IonAccordion,
  IonAvatar,
  IonButton,
  IonCol,
  IonGrid,
  IonIcon,
  IonImg,
  IonItem,
  IonLabel,
  IonRow,
  IonText,
} from "@ionic/react";
import { getReadableAmount } from "../utils/getReadableAmount";
import { useWeb3Provider } from "../context/Web3Context";
import { PoolItemList } from "./PoolItemList";
import { IPoolGroup } from "../interfaces/reserve.interface";
import { CHAIN_AVAILABLES } from "../constants/chains";

interface IPoolAccordionProps {
  handleSegmentChange: (e: { detail: { value: string } }) => void;
  poolGroup: IPoolGroup;
}

export function PoolAccordionGroup(props: IPoolAccordionProps) {
  const { poolGroup, handleSegmentChange } = props;
  const { walletAddress } = useWeb3Provider();

  return (
    <IonAccordion>
      <IonItem slot="header">
        <IonGrid>
          <IonRow class="ion-align-items-center ion-justify-content-between">
            <IonCol size-md="3"
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
                <IonImg src={poolGroup.logo}></IonImg>
              </IonAvatar>
              <IonLabel class="ion-padding-start" style={{fontSize: "1.2rem"}}>
                {poolGroup?.symbol}
                <p>
                  <small>{poolGroup?.name}</small>
                  {walletAddress && (
                    <IonText color="dark">
                      <br />
                      <small>
                        Wallet balance: {poolGroup.totalWalletBalance}
                      </small>
                    </IonText>
                  )}
                </p>
              </IonLabel>
            </IonCol>
            <IonCol size="1"
              class="ion-text-center ion-hide-md-down"
              style={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              {poolGroup.chainIds
              .map((id, i) => (
                <IonIcon
                  key={i}
                  color="medium"
                  style={{
                    fontSize: "0.8rem",
                    transform: i !== 0 ? "translateX(-0.1rem)" : "none",
                  }}
                  src={CHAIN_AVAILABLES.find((c) => c.id === id)?.logo}
                ></IonIcon>
              ))}
            </IonCol>
            <IonCol size="2" class="ion-text-end ion-hide-md-down">
              <IonLabel>
                {poolGroup.totalSupplyBalance > 0
                  ? (poolGroup.totalSupplyBalance).toFixed(6)
                  : "0.00"}
                <br />
                <IonText color="medium">
                  <small>
                    {getReadableAmount(
                      poolGroup.totalSupplyBalance,
                      Number(poolGroup.pools?.[0]?.priceInUSD),
                      "No deposit"
                    )}
                  </small>
                </IonText>
              </IonLabel>
            </IonCol>
            <IonCol size="2" class="ion-text-end ion-hide-md-down">
              <IonLabel>
                {poolGroup.totalBorrowBalance > 0
                  ? poolGroup.totalBorrowBalance.toFixed(6)
                  : poolGroup?.borrowingEnabled === false
                  ? "-"
                  : "0.00"}
                {poolGroup?.borrowingEnabled === true && (
                  <IonText color="medium">
                    <br />
                    <small>
                      {getReadableAmount(
                        +poolGroup?.totalBorrowBalance,
                        Number(poolGroup.pools?.[0]?.priceInUSD),
                        "No debit"
                      )}
                    </small>
                  </IonText>
                )}
              </IonLabel>
            </IonCol>
            <IonCol size="auto" size-md="2" class="ion-text-end ion-hide-sm-down">
              <IonLabel style={{"fontSize": "1.2rem"}}>
                {poolGroup.topSupplyApy * 100 === 0
                  ? "0"
                  : poolGroup.topSupplyApy * 100 < 0.01
                  ? "< 0.01"
                  : (poolGroup.topSupplyApy * 100).toFixed(2)}
                %
              </IonLabel>
            </IonCol>
            <IonCol size="2" class="ion-text-end ion-hide-sm-down">
              <IonLabel style={{"fontSize": "1.2rem"}}>
                {poolGroup?.topBorrowApy * 100 === 0
                  ? poolGroup?.borrowingEnabled === false
                    ? "- "
                    : `0%`
                  : poolGroup?.topBorrowApy * 100 < 0.01
                  ? `< 0.01%`
                  : (poolGroup?.topBorrowApy * 100).toFixed(2) + "%"}
              </IonLabel>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonItem>

      <div slot="content">
        <IonGrid className="ion-no-padding">
          <IonRow 
            style={{paddingRight: "70px"}}
            class="ion-no-padding ion-padding-start ion-align-items-center ion-justify-content-between">
            <IonCol size-md="2" class="ion-text-start ion-padding-start">
              <IonLabel color="medium">
                <h3>Asset</h3>
              </IonLabel>
            </IonCol>
            <IonCol size="auto" size-md="1"
              class="ion-text-end ion-hide-md-down"
            >
              <IonLabel color="medium">
                <h3>Protocol</h3>
              </IonLabel>
            </IonCol>
            <IonCol size="auto" size-md="2" 
              class="ion-text-end ion-hide-md-down"
              >
                <IonLabel color="medium">
                  <h3>
                    Deposit
                  </h3>
                </IonLabel>
            </IonCol>
            <IonCol size="auto" size-md="2" 
              class="ion-text-end ion-hide-md-down"
              >
                <IonLabel color="medium">
                  <h3>
                    Borrow
                  </h3>
                </IonLabel>
            </IonCol>
            <IonCol size="3" size-md="2" 
              class="ion-text-end"
              >
                <IonLabel color="medium">
                  <h3>
                    Deposit APY
                  </h3>
                </IonLabel>
            </IonCol>
            <IonCol size="auto" size-md="2" 
              class="ion-text-end ion-hide-md-down"
            >
              <IonLabel color="medium">
                <h3 className="ion-padding-end">
                  Borrow APY
                </h3>
              </IonLabel>
            </IonCol>
            {/* <IonCol size="1" className="ion-text-end"></IonCol> */}
          </IonRow>
        </IonGrid>
        {poolGroup.pools.map((p, i) => (
          <PoolItemList
            key={i}
            poolId={p.id}
            chainId={p.chainId}
            iconSize={"32px"}
            handleSegmentChange={handleSegmentChange}
          />
        ))}
      </div>
    </IonAccordion>
  );
}
