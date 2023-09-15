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
  useIonModal,
} from "@ionic/react";
import { openOutline, warningOutline } from "ionicons/icons";
import { useUser } from "../context/UserContext";
import { getReadableAmount } from "../utils/getReadableAmount";
import {
  CircularProgressbarWithChildren,
  buildStyles,
} from "react-circular-progressbar";
import {
  FormatReserveUSDResponse,
  FormatUserSummaryAndIncentivesResponse,
  valueToBigNumber,
} from "@aave/math-utils";
import ConnectButton from "./ConnectButton";
import { ReserveDataHumanized } from "@aave/contract-helpers";
import { useEthersProvider } from "../context/Web3Context";
import {
  MARKETTYPE,
  borrow,
  repay,
  supplyWithPermit,
  withdraw,
} from "../servcies/aave.service";
import { OverlayEventDetail } from "@ionic/react/dist/types/components/react-component-lib/interfaces";
import { useLoader } from "../context/LoaderContext";
import { LoanFormModal } from "./LoanFormModal";
import { getPercent } from "../utils/utils";
import { useState } from "react";
import { getMaxAmount } from "../utils/getMaxAmount";
import { PoolItemList } from "./PoolItemList";
import { IPoolGroup, IReserve, IUserSummary } from "../interfaces/reserve.interface";
import { PoolHeaderList } from "./PoolHeaderList";
import { CHAIN_AVAILABLES } from "../constants/chains";

interface IPoolAccordionProps {
  refresh: () => void;
  handleSegmentChange: (e: { detail: { value: string } }) => void;
  poolGroup: IPoolGroup;
  userSummaryAndIncentivesGroup: IUserSummary[]|null;
}

export function PoolAccordionGroup(props: IPoolAccordionProps) {
  const { refresh, handleSegmentChange, poolGroup, userSummaryAndIncentivesGroup } = props;
  const [state, setState] = useState<
    | {
        actionType: "deposit" | "withdraw" | "borrow" | "repay" | undefined;
        maxAmount: number;
      }
    | undefined
  >(undefined);
  const { user } = useUser();
  const { ethereumProvider } = useEthersProvider();
  const { display: displayLoader, hide: hideLoader } = useLoader();
  // const [present, dismiss] = useIonModal(LoanFormModal, {
  //   selectedReserve: {
  //     reserve: {
  //       ...reserve,
  //       maxAmount: state?.maxAmount || -1,
  //     },
  //     actionType: state?.actionType,
  //   },
  //   userSummary,
  //   onDismiss: (data: string, role: string) => dismiss(data, role),
  // });


  // function handleEvents(
  //   type: string,
  //   reserve: ReserveDataHumanized &
  //     FormatReserveUSDResponse & {
  //       borrowBalance: number;
  //       borrowBalanceUsd: number;
  //       supplyBalance: number;
  //       supplyBalanceUsd: number;
  //       walletBalance: number;
  //       logo: string;
  //       priceInUSD: string;
  //     }
  // ) {
  //   switch (true) {
  //     case type === "swap":
  //       handleSegmentChange({ detail: { value: "swap" } });
  //       break;
  //     case type === "fiat":
  //       handleSegmentChange({ detail: { value: "fiat" } });
  //       break;
  //     // case type === "openModal":
  //     //   handleOpenModal(type, reserve);
  //     //   break;
  //     default:
  //       break;
  //   }
  // }

  // function handleOpenModal(
  //   type: string,
  //   reserve: ReserveDataHumanized &
  //     FormatReserveUSDResponse & {
  //       borrowBalance: number;
  //       borrowBalanceUsd: number;
  //       supplyBalance: number;
  //       supplyBalanceUsd: number;
  //       walletBalance: number;
  //       logo: string;
  //       priceInUSD: string;
  //     }
  // ) {
  //   if (!userSummaryAndIncentivesGroup) {
  //     throw new Error("No userSummary found");
  //   }
  //   // // calcul max amount
  //   // const maxAmount = getMaxAmount(
  //   //   type,
  //   //   reserve,
  //   //   userSummary,
  //   //   markets?.CHAIN_ID
  //   // );
  //   // // update state
  //   // setState({
  //   //   actionType: type as "deposit" | "withdraw" | "borrow" | "repay",
  //   //   maxAmount,
  //   // });
  //   // console.log("[INFO] maxAmount: ", { type, reserve, maxAmount });

  //   // // call method to open modal
  //   // present({
  //   //   cssClass: "modalAlert ",
  //   //   onWillDismiss: async (ev: CustomEvent<OverlayEventDetail>) => {
  //   //     console.log(`onWillDismiss: ${ev.detail.data}!`);
  //   //     if (ev.detail.role === "confirm") {
  //   //       if (!ethereumProvider) {
  //   //         throw new Error("No ethereumProvider provider found");
  //   //       }
  //   //       displayLoader();
  //   //       switch (true) {
  //   //         case type === "deposit": {
  //   //           const value = ev.detail.data;
  //   //           const amount = Number(value);
  //   //           // handle invalid amount
  //   //           if (isNaN(amount) || amount <= 0) {
  //   //             throw new Error(
  //   //               "Invalid amount. Value must be greater than 0."
  //   //             );
  //   //           }
  //   //           // call method
  //   //           const params = {
  //   //             provider: ethereumProvider,
  //   //             reserve,
  //   //             amount: amount.toString(),
  //   //             onBehalfOf: undefined,
  //   //             poolAddress: `${markets?.POOL}`,
  //   //             gatewayAddress: `${markets?.WETH_GATEWAY}`,
  //   //           };
  //   //           console.log("params: ", params);
  //   //           try {
  //   //             const txReceipts = await supplyWithPermit(params);
  //   //             console.log("TX result: ", txReceipts);
  //   //             await hideLoader();
  //   //             await refresh();
  //   //           } catch (error) {
  //   //             await hideLoader();
  //   //           }
  //   //           break;
  //   //         }
  //   //         case type === "withdraw": {
  //   //           const value = ev.detail.data;
  //   //           const amount = Number(value);
  //   //           // handle invalid amount
  //   //           if (isNaN(amount) || amount <= 0) {
  //   //             throw new Error(
  //   //               "Invalid amount. Value must be greater than 0."
  //   //             );
  //   //           }
  //   //           // call method
  //   //           const params = {
  //   //             provider: ethereumProvider,
  //   //             reserve,
  //   //             amount: amount.toString(),
  //   //             onBehalfOf: undefined,
  //   //             poolAddress: `${markets?.POOL}`,
  //   //             gatewayAddress: `${markets?.WETH_GATEWAY}`,
  //   //           };
  //   //           console.log("params: ", params);
  //   //           try {
  //   //             const txReceipts = await withdraw(params);
  //   //             console.log("TX result: ", txReceipts);
  //   //             await hideLoader();
  //   //             await refresh();
  //   //           } catch (error) {
  //   //             console.log("error: ", error);
  //   //             await hideLoader();
  //   //           }
  //   //           break;
  //   //         }
  //   //         case type === "borrow": {
  //   //           const value = ev.detail.data;
  //   //           const amount = Number(value);
  //   //           // handle invalid amount
  //   //           if (isNaN(amount) || amount <= 0) {
  //   //             throw new Error(
  //   //               "Invalid amount. Value must be greater than 0."
  //   //             );
  //   //           }
  //   //           // call method
  //   //           const params = {
  //   //             provider: ethereumProvider,
  //   //             reserve,
  //   //             amount: amount.toString(),
  //   //             onBehalfOf: undefined,
  //   //             poolAddress: `${markets?.POOL}`,
  //   //             gatewayAddress: `${markets?.WETH_GATEWAY}`,
  //   //           };
  //   //           console.log("params: ", params);
  //   //           try {
  //   //             const txReceipts = await borrow(params);
  //   //             console.log("TX result: ", txReceipts);
  //   //             await hideLoader();
  //   //             refresh();
  //   //           } catch (error) {
  //   //             console.log("[ERROR]: ", error);
  //   //             await hideLoader();
  //   //             // await refresh();
  //   //           }
  //   //           break;
  //   //         }
  //   //         case type === "repay": {
  //   //           const value = ev.detail.data;
  //   //           const amount = Number(value);
  //   //           // handle invalid amount
  //   //           if (isNaN(amount) || amount <= 0) {
  //   //             throw new Error(
  //   //               "Invalid amount. Value must be greater than 0."
  //   //             );
  //   //           }
  //   //           // call method
  //   //           const params = {
  //   //             provider: ethereumProvider,
  //   //             reserve,
  //   //             amount: amount.toString(),
  //   //             onBehalfOf: undefined,
  //   //             poolAddress: `${markets?.POOL}`,
  //   //             gatewayAddress: `${markets?.WETH_GATEWAY}`,
  //   //           };
  //   //           console.log("params: ", params);
  //   //           try {
  //   //             const txReceipts = await repay(params);
  //   //             console.log("TX result: ", txReceipts);
  //   //             await hideLoader();
  //   //             await refresh();
  //   //           } catch (error) {
  //   //             console.log("[ERROR]: ", error);
  //   //             await hideLoader();
  //   //             // await refresh();
  //   //           }
  //   //           break;
  //   //         }
  //   //         default:
  //   //           break;
  //   //       }
  //   //     }
  //   //   },
  //   // });
  // }

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
                  height: "48px",
                  width: "48px",
                  minHeight: "48px",
                  minWidth: "48px",
                }}
              >
                <IonImg src={poolGroup.logo}></IonImg>
              </IonAvatar>
              <IonLabel class="ion-padding-start">
                {poolGroup?.symbol}
                <p>
                  <small>{poolGroup?.name}</small>
                  {user && (
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
              {poolGroup.chainIds.map((id, i) => (
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
                      Number(poolGroup.reserves?.[0]?.priceInUSD),
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
                        Number(poolGroup.reserves?.[0]?.priceInUSD),
                        "No debit"
                      )}
                    </small>
                  </IonText>
                )}
              </IonLabel>
            </IonCol>
            <IonCol size="auto" size-md="2" class="ion-text-end">
              <IonLabel>
                {poolGroup.topSupplyApy * 100 === 0
                  ? "0"
                  : poolGroup.topSupplyApy * 100 < 0.01
                  ? "< 0.01"
                  : (poolGroup.topSupplyApy * 100).toFixed(2)}
                %
              </IonLabel>
            </IonCol>
            <IonCol size="2" class="ion-text-end ion-hide-sm-down">
              <IonLabel>
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
            style={{paddingRight: "85px"}}
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
        {poolGroup.reserves.map((r, i) => (
          <PoolItemList
            key={i}
            reserve={r}
            chainId={r.chainId}
            userSummary={userSummaryAndIncentivesGroup?.find(s => s.chainId === r.chainId)}
            iconSize={"32px"}
          />
        ))}
      </div>
    </IonAccordion>
  );
}
