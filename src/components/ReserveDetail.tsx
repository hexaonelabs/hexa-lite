import {
  IonAvatar,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonChip,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonImg,
  IonItem,
  IonLabel,
  IonModal,
  IonRow,
  IonText,
  IonToolbar,
  useIonModal,
} from "@ionic/react";
import { IReserve, IUserSummary } from "../interfaces/reserve.interface";
import {
  CircularProgressbarWithChildren,
  buildStyles,
} from "react-circular-progressbar";
import { useUser } from "../context/UserContext";
import { getReadableAmount } from "../utils/getReadableAmount";
import { valueToBigNumber } from "@aave/math-utils";
import ConnectButton from "./ConnectButton";
import { LoanFormModal } from "./LoanFormModal";
import { useMemo, useRef, useState } from "react";
import { closeOutline, warningOutline } from "ionicons/icons";
import { CHAIN_AVAILABLES } from "../constants/chains";
import { WarningBox } from "./WarningBox";
import { getPercent } from "../utils/utils";
import { OverlayEventDetail } from "@ionic/react/dist/types/components/react-component-lib/interfaces";
import { MARKETTYPE, borrow, repay, supplyWithPermit, withdraw } from "../servcies/aave.service";
import { useEthersProvider } from "../context/Web3Context";
import { useLoader } from "../context/LoaderContext";
import { useAave } from "../context/AaveContext";
import { getAssetIconUrl } from "../utils/getAssetIconUrl";

interface IReserveDetailProps {
  reserve: IReserve;
  userSummary: IUserSummary | undefined;
  markets: MARKETTYPE | undefined
  dismiss: () => void;
  handleSegmentChange: (e: { detail: { value: string } }) => void;
}

export function ReserveDetail(props: IReserveDetailProps) {
  const { reserve, userSummary, markets, handleSegmentChange } = props;
  const { user } = useUser();
  const { display: displayLoader, hide: hideLoader } = useLoader();
  const { ethereumProvider, switchNetwork } = useEthersProvider();
  const [state, setState] = useState<
    | {
        actionType: "deposit" | "withdraw" | "borrow" | "repay" | undefined;
      }
    | undefined
  >(undefined);
  const { refresh } = useAave();
  const modal = useRef<HTMLIonModalElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);  
  const borrowPoolRatioInPercent = getPercent(
    valueToBigNumber(reserve.totalDebtUSD).toNumber(),
    valueToBigNumber(reserve.borrowCapUSD).toNumber()
  );
  const supplyPoolRatioInPercent = getPercent(
    valueToBigNumber(reserve.totalLiquidityUSD).toNumber(),
    valueToBigNumber(reserve.supplyCapUSD).toNumber()
  );
  const percentBorrowingCapacity = 100 - getPercent(
    Number(userSummary?.totalBorrowsUSD || 0), 
    Number(userSummary?.totalCollateralUSD)
  );

  const handleOpenModal = (type: string, reserve: IReserve) => {
    if (!userSummary) {
      throw new Error("No userSummary found");
    }
    setState({
      actionType: type as "deposit" | "withdraw" | "borrow" | "repay",
    });
    setIsModalOpen(true);
  };

  const onDismiss =  async (ev: CustomEvent<OverlayEventDetail>) => {
    console.log(`[INFO] ReserveDetail - onWillDismiss from LoanFormModal: `,ev.detail);
    if (!ethereumProvider) {
      throw new Error("No ethereumProvider found");
    }
    if (ev.detail.role !== "confirm") {
      return;
    }
    displayLoader();
    // switch network if need
    const network = await ethereumProvider.getNetwork();
    const provider = (network.chainId !== reserve.chainId)
      ? await switchNetwork(reserve.chainId)
      : ethereumProvider
    if (!provider) {
      hideLoader();
      throw new Error("No provider found or update failed");
    }
    // perform action
    const type = state?.actionType;
    switch (true) {
      case type === "deposit": {
        const value = ev.detail.data;
        const amount = Number(value);
        // handle invalid amount
        if (isNaN(amount) || amount <= 0) {
          throw new Error(
            "Invalid amount. Value must be greater than 0."
          );
        }
        // call method
        const params = {
          provider,
          reserve,
          amount: amount.toString(),
          onBehalfOf: undefined,
          poolAddress: `${markets?.POOL}`,
          gatewayAddress: `${markets?.WETH_GATEWAY}`,
        };
        console.log("params: ", params);
        try {
          const txReceipts = await supplyWithPermit(params)
          console.log("TX result: ", txReceipts);
          await hideLoader();
          // await refresh();
        } catch (error) {
          console.log("TX error: ", error);
          await hideLoader();
        }
        break;
      }
      case type === "withdraw": {
        const value = ev.detail.data;
        const amount = Number(value);
        // handle invalid amount
        if (isNaN(amount) || amount <= 0) {
          throw new Error(
            "Invalid amount. Value must be greater than 0."
          );
        }
        // call method
        const params = {
          provider,
          reserve,
          amount: amount.toString(),
          onBehalfOf: undefined,
          poolAddress: `${markets?.POOL}`,
          gatewayAddress: `${markets?.WETH_GATEWAY}`,
        };
        console.log("params: ", params);
        try {
          const txReceipts = await withdraw(params);
          console.log("TX result: ", txReceipts);
          await hideLoader();
          // await refresh();
        } catch (error) {
          console.log("error: ", error);
          await hideLoader();
        }
        break;
      }
      case type === "borrow": {
        const value = ev.detail.data;
        const amount = Number(value);
        // handle invalid amount
        if (isNaN(amount) || amount <= 0) {
          throw new Error(
            "Invalid amount. Value must be greater than 0."
          );
        }
        // call method
        const params = {
          provider,
          reserve,
          amount: amount.toString(),
          onBehalfOf: undefined,
          poolAddress: `${markets?.POOL}`,
          gatewayAddress: `${markets?.WETH_GATEWAY}`,
        };
        console.log("params: ", params);
        try {
          const txReceipts = await borrow(params);
          console.log("TX result: ", txReceipts);
          await hideLoader();
          // refresh();
        } catch (error) {
          console.log("[ERROR]: ", error);
          await hideLoader();
          // await refresh();
        }
        break;
      }
      case type === "repay": {
        const value = ev.detail.data;
        const amount = Number(value);
        // handle invalid amount
        if (isNaN(amount) || amount <= 0) {
          throw new Error(
            "Invalid amount. Value must be greater than 0."
          );
        }
        // call method
        const params = {
          provider,
          reserve,
          amount: amount.toString(),
          onBehalfOf: undefined,
          poolAddress: `${markets?.POOL}`,
          gatewayAddress: `${markets?.WETH_GATEWAY}`,
        };
        console.log("params: ", params);
        try {
          const txReceipts = await repay(params);
          console.log("TX result: ", txReceipts);
          await hideLoader();
          // await refresh();
        } catch (error) {
          console.log("[ERROR]: ", error);
          await hideLoader();
          // await refresh();
        }
        break;
      }
      default:
        break;
    }
    // update Pool data by update context
    await refresh('userSummary');
  };

  return (
    <>
      <IonHeader translucent={true} class="ion-no-border">
        <IonToolbar style={{ "--background": "transparent" }}>
          <IonButtons slot="end">
            <IonButton
              color="primary"
              size="large"
              onClick={() => props.dismiss()}
            >
              <IonIcon icon={closeOutline}></IonIcon>
            </IonButton>            
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding"  fullscreen={true}>

        <div className="ion-padding ion-text-center" style={{
            width: "100%",
            maxWidth: "800px",
            margin: "0rem auto 0",
          }}>
          <h2>Market details</h2>
        </div>
        <IonGrid
          style={{
            width: "100%",
            maxWidth: "800px",
            minHeight: "100%",
            marginTop: "0rem",
          }}
        >
          <IonRow class="widgetWrapper  ion-justify-content-center">
            <IonCol size="12" size-md="12"  style={{
              background: 'rgba(var(--ion-color-light-rgb), 0.6) !important'
            }}>
              <IonGrid className="ion-no-padding">
                <IonRow>
                  <IonCol size="6" class="ion-text-start" style={{padding: '0.25rem 0 0.5rem 1.8rem',}}>
                    <IonText color="medium">
                      <small>Asset</small>
                    </IonText>
                  </IonCol>
                  <IonCol size="6" class="ion-text-end ion-padding-end"  style={{padding: '0.25rem 1.8rem 0.5rem 0'}}>
                    <IonText color="medium">
                      <small>Market pool</small>
                    </IonText>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </IonCol>

            <IonCol
              size-md="6"
              class="ion-text-start ion-padding horizontalLineBottom"
              style={{
                display: "flex",
                alignItems: "center",
                alignContent: "center",
                paddingBottom: "32px",
              }}
            >
              <div
                style={{ minWidth: "84px", position: "relative" }}
                className="ion-padding-start"
              >
                <IonAvatar
                  style={{
                    height: "84px",
                    width: "84px",
                    minHeight: "84px",
                    minWidth: "84px",
                  }}
                >
                  <IonImg src={reserve.logo}></IonImg>
                </IonAvatar>
                <IonIcon
                  style={{
                    fontSize: "1.6rem",
                    transform: "translateX(-0.2rem)",
                    position: "absolute",
                    bottom: "0rem",
                  }}
                  src={
                    CHAIN_AVAILABLES.find((c) => c.id === reserve.chainId)?.logo
                  }
                ></IonIcon>
              </div>
              <IonLabel class="ion-padding-start">
                <h2>
                  {reserve?.symbol}
                  <small style={{ display: "block" }}>
                    {CHAIN_AVAILABLES.find((c) => c.id === reserve.chainId)?.name}{" "}
                    network
                  </small>
                </h2>
                {(reserve?.usageAsCollateralEnabled === false ||
                  reserve.isIsolated === true) && (
                  <IonIcon
                    icon={warningOutline}
                    color="warning"
                    style={{ marginLeft: "0.5rem" }}
                  ></IonIcon>
                )}
              </IonLabel>
            </IonCol>
            <IonCol
              size-md="6"
              class="ion-text-end ion-padding horizontalLineBottom"
              style={{
                display: "flex",
                alignItems: "center",
                alignContent: "center",
                justifyContent: "flex-end",
                paddingBottom: "32px",
              }}
            >
              <IonLabel class="ion-padding-start">
                <h2>
                 AAVE V3
                  <small style={{ display: "block" }}>
                    Lending & Borrowing
                  </small>
                </h2>
              </IonLabel>
              <div
                style={{ minWidth: "84px", position: "relative" }}
                className="ion-padding-start ion-padding-end"
              >
                <IonAvatar
                  style={{
                    height: "84px",
                    width: "84px",
                    minHeight: "84px",
                    minWidth: "84px",
                  }}
                >
                  <IonImg src={getAssetIconUrl({symbol: 'AAVE'})}></IonImg>
                </IonAvatar>
              </div>
            </IonCol>
            {!reserve.usageAsCollateralEnabled && (
              <IonCol
                size-md="12"
                class="ion-padding ion-text-center horizontalLineBottom"
              >
                <WarningBox>
                  <>
                    This asset can not be used as collateral. <br />
                    Providing liquidity with this asset will not incrase your
                    borrowing capacity.
                  </>
                </WarningBox>
              </IonCol>
            )}
            {reserve.isIsolated === true && (
              <IonCol
                size-md="12"
                class="ion-padding ion-text-center horizontalLineBottom"
              >
                <WarningBox>
                  <>
                    This asset can only be used as collateral in isolation mode
                    only. <br />
                    In Isolation mode you cannot supply other assets as collateral
                    for borrowing. <br />
                    Assets used as collateral in Isolation mode can only be
                    borrowed to a specific debt ceiling
                  </>
                </WarningBox>
              </IonCol>
            )}
            <IonCol size-md="6" class="ion-padding ion-text-center">
              <div
                className="ion-margin-top"
                style={{
                  maxWidth: 200,
                  maxHeight: 200,
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
                <CircularProgressbarWithChildren
                  styles={buildStyles({
                    textColor: "var(--ion-text-color)",
                    pathColor:
                      supplyPoolRatioInPercent < 80
                        ? "var(--ion-color-primary)"
                        : "var(--ion-color-danger)",
                    trailColor: "rgba(var(--ion-color-primary-rgb), 0.2)",
                  })}
                  value={supplyPoolRatioInPercent}
                >
                  <div>
                    <h3>{`${supplyPoolRatioInPercent.toFixed(2)}%`}</h3>
                    <IonText color="medium">
                      <small>Total deposit</small>
                    </IonText>
                  </div>
                </CircularProgressbarWithChildren>
              </div>
              <div className="ion-padding">
                <IonItem
                  lines="none"
                  style={{
                    "--background": "transparent",
                    marginBottom: "1.5rem",
                  }}
                >
                  <IonLabel class="ion-text-center">Deposit details</IonLabel>
                </IonItem>
                {user && (
                  <IonItem style={{ "--background": "transparent" }}>
                    <IonLabel color="medium">My deposit</IonLabel>
                    <div className="ion-text-end">
                      <IonText color="medium">
                        {+reserve?.supplyBalance > 0
                          ? (+reserve?.supplyBalance).toFixed(6)
                          : undefined || "0"}
                      </IonText>
                      <br />
                      <IonText color="medium">
                        <small>
                          {getReadableAmount(
                            +reserve?.supplyBalance,
                            Number(reserve?.priceInUSD),
                            "No deposit"
                          )}
                        </small>
                      </IonText>
                    </div>
                  </IonItem>
                )}
                <IonItem style={{ "--background": "transparent" }}>
                  <IonLabel color="medium">APY</IonLabel>
                  <IonText color="medium">
                    {(Number(reserve?.supplyAPY || 0) * 100).toFixed(2)}%
                  </IonText>
                </IonItem>

                <IonItem style={{ "--background": "transparent" }}>
                  <IonLabel color="medium">Deposit liquidity</IonLabel>
                  <IonText color="medium">
                    {getReadableAmount(
                      valueToBigNumber(reserve.totalLiquidityUSD).toNumber()
                    )}
                  </IonText>
                </IonItem>
                <IonItem lines="none" style={{ "--background": "transparent" }}>
                  <IonLabel color="medium">Deposit capitalisation</IonLabel>
                  <IonText color="medium">
                    {getReadableAmount(Number(reserve.supplyCapUSD))}
                  </IonText>
                </IonItem>
              </div>
              <div className="ion-margin-vertical ion-padding-vertical">
                {user && (
                  <>
                    {Number(reserve.walletBalance || 0) <= 0 &&
                    reserve.supplyBalance <= 0 ? (
                      <>
                        {<IonButton
                            fill="solid"
                            color="gradient"
                            onClick={() => handleSegmentChange({ detail: { value: "swap" } })}
                          >
                            Exchange assets
                          </IonButton>}
                        {<IonButton
                            fill="solid"
                            color="gradient"
                            onClick={() => handleSegmentChange({ detail: { value: "fiat" } })}
                          >
                            Buy assets
                          </IonButton>}
                      </>
                    ) : (
                      <>
                        <IonButton
                          fill="solid"
                          color="gradient"
                          disabled={
                            !reserve?.supplyBalance || +reserve.supplyBalance <= 0
                              ? true
                              : false
                          }
                          onClick={() => handleOpenModal("withdraw", reserve)}
                        >
                          Withdraw
                        </IonButton>
                        <IonButton
                          fill="solid"
                          color="gradient"
                          disabled={
                            supplyPoolRatioInPercent > 99
                              ? true
                              : !reserve?.walletBalance ||
                                reserve.walletBalance <= 0
                              ? true
                              : false
                          }
                          onClick={() => handleOpenModal("deposit", reserve)}
                        >
                          Deposit
                        </IonButton>
                      </>
                    )}
                  </>
                )}
              </div>
            </IonCol>

            {reserve.borrowingEnabled && (
              <IonCol
                size-md="6"
                class="verticalLineBefore ion-padding ion-text-center"
              >
                <div
                  className="ion-margin-top"
                  style={{
                    maxWidth: 200,
                    maxHeight: 200,
                    marginLeft: "auto",
                    marginRight: "auto",
                  }}
                >
                  <CircularProgressbarWithChildren
                    styles={buildStyles({
                      textColor: "var(--ion-text-color)",
                      pathColor:
                        borrowPoolRatioInPercent < 80
                          ? "var(--ion-color-primary)"
                          : "var(--ion-color-danger)",
                      trailColor: "rgba(var(--ion-color-primary-rgb), 0.2)",
                    })}
                    value={borrowPoolRatioInPercent}
                  >
                    <div>
                      <h3>{`${borrowPoolRatioInPercent.toFixed(2)}%`}</h3>
                      <IonText color="medium">
                        <small>Total debits</small>
                      </IonText>
                    </div>
                  </CircularProgressbarWithChildren>
                </div>
                <div className="ion-padding">
                  <IonItem
                    lines="none"
                    style={{
                      "--background": "transparent",
                      marginBottom: "1.5rem",
                    }}
                  >
                    <IonLabel class="ion-text-center">Borrow details</IonLabel>
                  </IonItem>
                  {user && (
                    <IonItem style={{ "--background": "transparent" }}>
                      <IonLabel color="medium">My debit</IonLabel>
                      <div className="ion-text-end">
                        <IonText color="medium">
                          {reserve?.borrowBalance > 0
                            ? reserve?.borrowBalance.toFixed(6)
                            : undefined || "0"}
                        </IonText>
                        <br />
                        <IonText color="medium">
                          <small>
                            {getReadableAmount(
                              +reserve?.borrowBalance,
                              Number(reserve?.priceInUSD),
                              "No debit"
                            )}
                          </small>
                        </IonText>
                      </div>
                    </IonItem>
                  )}
                  <IonItem style={{ "--background": "transparent" }}>
                    <IonLabel color="medium">APY</IonLabel>
                    <IonText color="medium">
                      {(Number(reserve?.variableBorrowAPY || 0) * 100).toFixed(2)}
                      %
                    </IonText>
                  </IonItem>
                  <IonItem style={{ "--background": "transparent" }}>
                    <IonLabel color="medium">Debit liquidity</IonLabel>
                    <IonText color="medium">
                      {getReadableAmount(Number(reserve.totalDebtUSD))}
                      {/* {formatCurrencyValue(+reserve.totalLiquidityUSD)} */}
                      {/* <FormattedNumber
                        compact={true}
                        value={Math.max(Number(reserve.totalLiquidityUSD), 0)}
                        symbol="USD"
                      /> */}
                      {/* {valueToBigNumber(reserve.supplyCapUSD).toNumber()} */}
                    </IonText>
                  </IonItem>
                  <IonItem lines="none" style={{ "--background": "transparent" }}>
                    <IonLabel color="medium">Borrow capitalisation</IonLabel>
                    <IonText color="medium">
                      {getReadableAmount(Number(reserve.borrowCapUSD))}
                    </IonText>
                  </IonItem>
                </div>
                <div className="ion-margin-vertical ion-padding-vertical">
                  {user ? (
                    <>
                      <IonButton
                        fill="solid"
                        color="gradient"
                        disabled={
                          !reserve?.borrowBalance || reserve.borrowBalance <= 0
                            ? true
                            : false
                        }
                        onClick={() => handleOpenModal("repay", reserve)}
                      >
                        Repay
                      </IonButton>
                      <IonButton
                        fill="solid"
                        color="gradient"
                        disabled={
                          borrowPoolRatioInPercent > 99
                            ? true
                            : percentBorrowingCapacity <= 0
                            ? true
                            : false
                        }
                        onClick={() => handleOpenModal("borrow", reserve)}
                      >
                        Borrow
                      </IonButton>
                    </>
                  ) : (
                    <></>
                  )}
                </div>
              </IonCol>
            )}

            {!user && (
              <IonCol
                size="12"
                class="ion-padding ion-margin-bottom ion-text-center"
              >
                <ConnectButton></ConnectButton>
              </IonCol>
            )}
          </IonRow>
        </IonGrid>
      </IonContent>

      <IonModal
        ref={modal}
        className="modalAlert"
        isOpen={isModalOpen}>
          <LoanFormModal 
            selectedReserve={{
              reserve,
              actionType: state?.actionType||"deposit",
            }}
            userSummary={userSummary as IUserSummary}
            onDismiss={async (data, role) => {
              setIsModalOpen(false);
              onDismiss({
                detail: {
                  data, role
                }
              } as CustomEvent<OverlayEventDetail>)
            }}
          />
        </IonModal>
        
    </>
  );
}
