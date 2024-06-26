import {
  IonAvatar,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonChip,
  IonCol,
  IonContent,
  IonFabButton,
  IonFabList,
  IonFooter,
  IonGrid,
  IonHeader,
  IonIcon,
  IonImg,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonProgressBar,
  IonRow,
  IonText,
  IonTitle,
  IonToolbar,
  useIonAlert,
  useIonModal,
  useIonToast,
} from "@ionic/react";
import {
  IMarketPool,
  IProtocolSummary,
  IUserSummary,
  ReserveDetailActionType,
} from "../interfaces/reserve.interface";
import { ethers } from "ethers";
import { getReadableAmount } from "../utils/getReadableAmount";
import { valueToBigNumber } from "@aave/math-utils";
import ConnectButton from "./ui/ConnectButton";
import { LoanFormModal } from "./LoanFormModal";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  closeOutline,
  warningOutline,
  closeSharp,
  checkmarkCircleOutline,
} from "ionicons/icons";
import { CHAIN_AVAILABLES } from "../constants/chains";
import { WarningBox } from "./WarningBox";
import { getPercent } from "../utils/utils";
import { OverlayEventDetail } from "@ionic/react/dist/types/components/react-component-lib/interfaces";
import {
  MARKETTYPE,
  borrow,
  repay,
  supplyWithPermit,
  withdraw,
} from "../servcies/aave.service";
import { useLoader } from "../context/LoaderContext";
import { getAssetIconUrl } from "../utils/getAssetIconUrl";
import { SymbolIcon } from "./SymbolIcon";
import { ApyDetail } from "./ApyDetail";
import { AavePool, IAavePool } from "@/pool/Aave.pool";
import { MarketPool } from "@/pool/Market.pool";
import Store from "@/store";
import {
  getPoolGroupsState,
  getProtocolSummaryState,
  getUserSummaryAndIncentivesGroupState,
  getWeb3State,
} from "@/store/selectors";
import {
  getPoolSupplyAndBorrowBallance,
  getPoolWalletBalance,
} from "@/utils/getPoolWalletBalance";
import { initializeUserSummary } from "@/store/effects/pools.effect";
import { ModalMessage } from "./ModalMessage";
import { currencyFormat } from "@/utils/currencyFormat";
import { isMobilePWADevice } from "@/utils/isMobile";

interface IReserveDetailProps {
  pool: MarketPool;
  dismiss: (actionType?: string) => void;
  handleSegmentChange: (e: { detail: { value: string } }) => void;
}

export function ReserveDetail(props: IReserveDetailProps) {
  const {
    pool: { id, chainId },
    dismiss,
    handleSegmentChange,
  } = props;
  const {
    signer,
    currentNetwork,
    walletAddress,
    assets,
    switchNetwork,
    loadAssets,
  } = Store.useState(getWeb3State);
  const [state, setState] = useState<
    | {
        actionType: ReserveDetailActionType;
      }
    | undefined
  >(undefined);
  const poolGroups = Store.useState(getPoolGroupsState);
  const userSummaryAndIncentivesGroup = Store.useState(
    getUserSummaryAndIncentivesGroupState
  );
  const [present, dismissToast] = useIonToast();
  const [presentAlert] = useIonAlert();
  const [presentSuccess, dismissSuccess] = useIonModal(() => (
    <ModalMessage dismiss={dismissSuccess}>
      <IonText>
        <IonIcon
          color="success"
          style={{
            display: "block",
            fontSize: "5rem",
            margin: "1rem auto",
          }}
          src={checkmarkCircleOutline}
        />
        <h3 className="ion-margin-vertical">
          {state?.actionType.toLocaleUpperCase()} with Success!
        </h3>
      </IonText>
    </ModalMessage>
  ));
  const [presentPomptCrossModal, dismissPromptCrossModal] = useIonModal(
    <>
      <IonGrid className="ion-no-padding">
        <IonRow class="ion-align-items-top ion-padding">
          <IonCol size="10">
            <IonText>
              <h3 style={{ marginBottom: 0 }}>
                <b>Information</b>
              </h3>
            </IonText>
          </IonCol>
          <IonCol size="2" class="ion-text-end">
            <IonButton
              size="small"
              fill="clear"
              onClick={() => {
                dismissPromptCrossModal();
              }}
            >
              <IonIcon slot="icon-only" icon={closeSharp}></IonIcon>
            </IonButton>
          </IonCol>
        </IonRow>
        <IonRow class="ion-align-items-center ion-padding-horizontal">
          <IonCol size="12">
            <p>
              Deposit collateral to AAVE V3 on{" "}
              {CHAIN_AVAILABLES.find((c) => c.id === chainId)?.name} network to
              enable borrowing capacity.
            </p>
            {/* TODO: enable this features */}
            {/* <UseCrossChaineCollateralButton 
              dismissPromptCrossModal={() => dismissPromptCrossModal(null, "enable-crosschain-collateral")}
              userSummaryAndIncentivesGroup={userSummaryAndIncentivesGroup||[]} /> */}
          </IonCol>
          <IonCol size="12" className="ion-padding-bottom">
            <IonButton
              color="gradient"
              expand="block"
              onClick={() => dismissPromptCrossModal()}
            >
              OK
            </IonButton>
          </IonCol>
        </IonRow>
      </IonGrid>
    </>
  );
  const { display: displayLoader, hide: hideLoader } = useLoader();
  // const modal = useRef<HTMLIonModalElement>(null);
  const [isCrossChain, setIsCrossChain] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOptionsOpen, setIsModalOptionsOpen] = useState(false);
  const [tokenDetails, setTokenDetails] = useState<{
    description: any;
    fullyDilutedValuationUSD: any;
    marketCapUSD: any;
    maxSupply: any;
    totalSupply: any;
    circulatingSupply: any;
  }>(undefined as any);

  // find pool in `poolGroups[*].pool` by `poolId`
  const poolGroup = poolGroups.find(({ pools }) =>
    pools.find((p) => p.id === id)
  );
  if (!poolGroup) {
    throw new Error("No poolGroup found");
  }

  const userSummary = userSummaryAndIncentivesGroup?.find((group) =>
    group?.userReservesData?.find(({ reserve }) => reserve.id === id)
  );
  const pool = poolGroup.pools.find((r) => r.id === id);

  if (!pool) {
    throw new Error("No pool found");
  }

  const walletBalance = getPoolWalletBalance(pool, assets);
  const {
    borrowBalance,
    supplyBalance,
    poolLiquidationThreshold,
    userLiquidationThreshold,
  } = getPoolSupplyAndBorrowBallance(pool, userSummaryAndIncentivesGroup || []);

  const protocolSummary = Store.useState(getProtocolSummaryState).find(
    (p) => p.chainId === pool.chainId && p.provider === pool.provider
  );

  const borrowPoolRatioInPercent = getPercent(
    valueToBigNumber(pool.totalDebtUSD).toNumber(),
    valueToBigNumber(pool.borrowCapUSD).toNumber()
  );

  const supplyPoolRatioInPercent = getPercent(
    valueToBigNumber(pool.totalLiquidityUSD).toNumber(),
    valueToBigNumber(pool.supplyCapUSD).toNumber()
  );

  const percentBorrowingCapacity =
    100 -
    getPercent(
      protocolSummary?.totalBorrowsUSD || 0,
      protocolSummary?.totalCollateralUSD || 0
    );

  const handleOpenModal = (type: ReserveDetailActionType) => {
    if (!poolGroup) {
      throw new Error("No poolGroup found");
    }
    if (type === "crosschain-collateral") {
      setIsCrossChain(() => true);
    }
    setState({
      actionType: type,
    });
    setIsModalOpen(true);
  };

  const onDismiss = async (ev: CustomEvent<OverlayEventDetail>) => {
    console.log(
      `[INFO] ReserveDetail - onWillDismiss from LoanFormModal: `,
      ev.detail
    );
    if (!signer) {
      throw new Error("No signer found");
    }
    if (!signer) {
      throw new Error("No EVM signer");
    }
    if (ev.detail.role !== "confirm") {
      return;
    }
    displayLoader();
    if (currentNetwork !== pool.chainId) {
      await switchNetwork(pool.chainId);
    }
    if (!signer) {
      throw new Error("No provider found or update failed");
    }
    // perform action
    const type = state?.actionType;
    const value = ev.detail.data;
    const amount = Number(value);
    switch (true) {
      case type === "deposit": {
        await pool.deposit(amount, signer);
        break;
      }
      case type === "withdraw": {
        await pool.withdraw(amount, signer);
        break;
      }
      case type === "borrow": {
        await pool.borrow(amount, signer);
        break;
      }
      case type === "repay": {
        await pool.repay(amount, signer);
        break;
      }
      default:
        break;
    }
    // update userSummary & wallet assets after action
    if (walletAddress) {
      await initializeUserSummary(walletAddress);
      await loadAssets(true);
    }
  };

  const BuyAssetBtn =
    walletAddress && +(walletBalance || 0) <= 0 && supplyBalance <= 0 ? (
      <IonButton
        fill="solid"
        expand="block"
        color="gradient"
        onClick={() => {
          setIsModalOptionsOpen(() => false);
          handleSegmentChange({
            detail: { value: "fiat" },
          });
        }}
      >
        Buy {pool.symbol}
      </IonButton>
    ) : (
      <></>
    );

  const ExchangeAssetBtn =
    walletAddress && (walletBalance || 0) <= 0 && supplyBalance <= 0 ? (
      <IonButton
        fill="solid"
        expand="block"
        color="gradient"
        onClick={() => {
          setIsModalOptionsOpen(() => false);
          handleSegmentChange({
            detail: { value: "swap" },
          });
        }}
      >
        Exchange assets
      </IonButton>
    ) : (
      <></>
    );

  const WithdrawBtn =
    walletAddress && (supplyBalance || supplyBalance > 0) ? (
      <IonButton
        fill="solid"
        expand="block"
        color="gradient"
        onClick={() => {
          setIsModalOptionsOpen(() => false);
          handleOpenModal("withdraw");
        }}
      >
        Withdraw
      </IonButton>
    ) : (
      <></>
    );
  const DepositBtn =
    walletAddress &&
    (walletBalance || 0) > 0 &&
    (supplyPoolRatioInPercent < 99 || Infinity) ? (
      <IonButton
        fill="solid"
        expand="block"
        color="gradient"
        onClick={() => {
          setIsModalOptionsOpen(() => false);
          handleOpenModal("deposit");
        }}
      >
        Deposit {pool.symbol} as collateral
      </IonButton>
    ) : (
      <IonButton fill="solid" expand="block" color="gradient" disabled={true}>
        Deposit {pool.symbol} as collateral
      </IonButton>
    );

  const RepayBtn =
    walletAddress && (borrowBalance || borrowBalance > 0) ? (
      <IonButton
        fill="solid"
        expand="block"
        color="gradient"
        onClick={() => {
          setIsModalOptionsOpen(() => false);
          handleOpenModal("repay");
        }}
      >
        Repay loan
      </IonButton>
    ) : (
      <></>
    );

  const BorrowBtn =
    walletAddress && pool.borrowingEnabled && borrowPoolRatioInPercent < 99 ? (
      <IonButton
        fill="solid"
        color="gradient"
        expand="block"
        onClick={() => {
          setIsModalOptionsOpen(() => false);
          if (borrowPoolRatioInPercent > 99.9) {
            presentAlert({
              header: "Information",
              message:
                "Borrowing capacity is over. Add more collaterals to enable borrowing.",
              buttons: [{ text: "OK", cssClass: "gradient" }],
            });
            return;
          }
          if (percentBorrowingCapacity <= 0) {
            presentPomptCrossModal({
              cssClass: ["modalAlert"],
              onDidDismiss: ({ detail: { data, role } = {} }) => {
                if (role !== "enable-crosschain-collateral") {
                  return;
                }
                // handle cross-chain collateral request
                console.log("onDidDismiss: ", { data, role });
                setIsCrossChain(() => true);
                handleOpenModal("borrow");
              },
            });
            return;
          }
          handleOpenModal("borrow");
        }}
      >
        Borrow {pool.symbol}
      </IonButton>
    ) : (
      <IonButton fill="solid" color="gradient" expand="block" disabled={true}>
        Borrow {pool.symbol}
      </IonButton>
    );

  // useEffect(() => {
  //   if (!pool.symbol) {return}
  //   loadTokenData(pool.symbol).then((details) => {
  //     if (!details) return;
  //     setTokenDetails(() => details);
  //   });
  // }, [pool.symbol]);

  const callActionsBtn = walletAddress ? (
    <>
      <IonButton
        color="gradient"
        expand={isMobilePWADevice ? 'block': undefined}
        onClick={() => {
          setIsModalOptionsOpen(() => true);
        }}
      >
        Choose option
      </IonButton>
    </>
  ) : (
    <ConnectButton expand={isMobilePWADevice ? 'block': undefined}></ConnectButton>
  );

  return (
    <>
      <IonHeader className="ion-no-border" translucent={true}>
        <IonToolbar style={{ "--background": "transparent", minHeight: "85px", display: "flex"}}>
          <IonTitle>
            Pool {pool?.symbol}
            <small
              style={{
                display: "block",
                fontSize: "0.8rem",
                fontWeight: "normal",
              }}
            >
              {
                CHAIN_AVAILABLES.find(
                  (c) => c.id === pool.chainId
                )?.name
              }{" "} Network
            </small>
          </IonTitle>
          <IonButtons slot="end">
            <IonButton
              color="primary"
              size="large"
              onClick={() => dismiss(state?.actionType)}
            >
              <IonIcon icon={closeOutline}></IonIcon>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent
          fullscreen={true} 
          className="ion-padding">
        <IonHeader collapse="condense">
          <IonToolbar style={{ "--background": "transparent" }} className="ion-text-center ion-padding-bottom">
              <h1>Market Details</h1>
          </IonToolbar>
        </IonHeader>
        <IonGrid
          style={{
            width: "100%",
            maxWidth: "800px",
            minHeight: "100%",
            marginTop: "0rem",
          }}
        >
          <IonRow class="widgetWrapper ion-align-items-center">
            <IonCol
              size="12"
              size-md="12"
              className="horizontalLineBottom ion-padding-vertical"
            >
              <IonGrid className="ion-no-padding ion-padding-vertical">
                <IonRow className="ion-align-items-center  ion-padding">
                  <IonCol
                    size-xs="12"
                    size-sm="12"
                    size-md="12"
                    size-lg="6"
                    class="ion-text-center ion-padding"
                    style={{
                      margin: "0 auto 1rem",
                    }}
                  >
                    <IonGrid>
                      <IonRow>
                        <IonCol 
                          size-xs="12"
                          size-sm="12"
                          size-md="12"
                          size-lg="auto">
                          <SymbolIcon
                            symbol={pool?.symbol}
                            chainId={pool?.chainId}
                            assetIconURL={pool?.logo}
                            iconSize="124px"
                          />
                        </IonCol>
                        <IonCol
                          size-xs="12"
                          size-sm="12"
                          size-md="12"
                          size-lg="auto"
                          className="ion-padding-horizontal">
                          <h2>
                            <b>{pool?.symbol}</b>
                            <IonText color="medium">
                              <small style={{ display: "block" }}>
                                {
                                  CHAIN_AVAILABLES.find(
                                    (c) => c.id === pool.chainId
                                  )?.name
                                }{" "}
                                network
                              </small>
                            </IonText>
                          </h2>
                          {pool.usageAsCollateralEnabled === false && (
                            <IonIcon
                              icon={warningOutline}
                              color="warning"
                              style={{ marginLeft: "0.5rem" }}
                            ></IonIcon>
                          )}
                        </IonCol>
                      </IonRow>
                    </IonGrid>
                  </IonCol>
                  <IonCol
                    size-xs="12"
                    size-sm="12"
                    size-md="12"
                    size-lg="6"
                    className="ion-text-center"
                  >
                    {!isMobilePWADevice ? callActionsBtn : null}
                  </IonCol>
                  {tokenDetails && (
                    <IonCol
                      size="12"
                      className="ion-padding-top ion-margin-top itemListDetails"
                    >
                      <IonLabel className="ion-padding-start ion-padding-vertical">
                        <b>Token details</b>
                      </IonLabel>
                      <div>
                        <IonItem lines="none">
                          <IonLabel>Total market capitalisation</IonLabel>
                          <IonText slot="end">
                            {getReadableAmount(
                              valueToBigNumber(
                                tokenDetails.marketCapUSD
                              ).toNumber()
                            )}
                          </IonText>
                        </IonItem>
                        <IonItem lines="none">
                          <IonLabel>Fully Diluted Valuation USD</IonLabel>
                          <IonText slot="end">
                            {getReadableAmount(
                              valueToBigNumber(
                                tokenDetails.fullyDilutedValuationUSD
                              ).toNumber()
                            )}
                          </IonText>
                        </IonItem>
                        <IonItem lines="none">
                          <IonLabel>Total current token supply</IonLabel>
                          <IonText slot="end">
                            {getReadableAmount(
                              valueToBigNumber(
                                tokenDetails.totalSupply
                              ).toNumber()
                            )}
                          </IonText>
                        </IonItem>
                        <IonItem lines="none">
                          <IonLabel>Maximum token supply</IonLabel>
                          <IonText slot="end">
                            {getReadableAmount(
                              valueToBigNumber(
                                tokenDetails.maxSupply
                              ).toNumber()
                            )}
                          </IonText>
                        </IonItem>
                        <IonItem lines="none">
                          <IonLabel>Current token circulating supply</IonLabel>
                          <IonText slot="end">
                            {getReadableAmount(
                              valueToBigNumber(
                                tokenDetails.circulatingSupply
                              ).toNumber()
                            )}
                          </IonText>
                        </IonItem>
                      </div>
                    </IonCol>
                  )}
                </IonRow>
              </IonGrid>
            </IonCol>

            {!pool.usageAsCollateralEnabled && (
              <IonCol
                size="12"
                class="ion-padding ion-text-start horizontalLineBottom"
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

            {/* {pool.isIsolated === true && (
              <IonCol
                size="12"
                class="ion-padding ion-text-start horizontalLineBottom"
              >
                <WarningBox>
                  <>
                    This asset can only be used as collateral in isolation mode
                    only. <br />
                    In Isolation mode you cannot supply other assets as
                    collateral for borrowing. <br />
                    Assets used as collateral in Isolation mode can only be
                    borrowed to a specific debt ceiling
                  </>
                </WarningBox>
              </IonCol>
            )} */}

            <IonCol size="12" size-md="12" className="ion-no-padding">
              <IonGrid className="ion-no-padding">
                <IonRow className="ion-align-items-center ion-no-padding">
                  {walletAddress && (
                    <IonCol
                      size="12"
                      className="itemListDetails horizontalLineBottom ion-padding"
                    >
                      <IonLabel className="ion-padding-start ion-padding-top">
                        <b>My positions</b>
                      </IonLabel>
                      <IonList lines="none" className="ion-padding-vertical">
                        <IonItem lines="none">
                          <IonLabel>Deposit</IonLabel>

                          <div className="ion-text-end">
                            <IonText style={{ fontSize: "1rem" }}>
                              {+pool?.supplyBalance > 0
                                ? (+pool?.supplyBalance).toFixed(6)
                                : undefined || "0"}
                            </IonText>
                            <br />
                            <IonText color="medium">
                              <small>
                                {getReadableAmount(
                                  +pool?.supplyBalance,
                                  Number(pool?.priceInUSD),
                                  "No deposit"
                                )}
                              </small>
                            </IonText>
                          </div>
                        </IonItem>
                        {pool.borrowingEnabled && (
                          <>
                            <IonItem lines="none">
                              <IonLabel className="ion-padding-vertical">
                                Debit
                              </IonLabel>

                              <div className="ion-text-end">
                                <IonText style={{ fontSize: "1rem" }}>
                                  {pool?.borrowBalance > 0
                                    ? pool?.borrowBalance.toFixed(6)
                                    : undefined || "0"}
                                </IonText>
                                <br />
                                <IonText color="medium">
                                  <small>
                                    {getReadableAmount(
                                      +pool?.borrowBalance,
                                      Number(pool?.priceInUSD),
                                      "No debit"
                                    )}
                                  </small>
                                </IonText>
                              </div>
                            </IonItem>
                            <IonItem lines="none">
                              <IonLabel>Borrowing capacity</IonLabel>
                              <div slot="end" className="ion-text-end">
                                {poolGroup &&
                                  Number(
                                    protocolSummary?.totalCollateralUSD || 0
                                  ) > 0 && (
                                    <>
                                      <IonText color="dark">
                                        {currencyFormat.format(
                                          Number(
                                            protocolSummary?.totalBorrowsUSD ||
                                              0
                                          )
                                        )}{" "}
                                        of{" "}
                                        {currencyFormat.format(
                                          Number(
                                            protocolSummary?.totalCollateralUSD ||
                                              0
                                          ) *
                                            Number(
                                              protocolSummary?.currentLiquidationThreshold ||
                                                0
                                            )
                                        )}{" "}
                                      </IonText>
                                      <IonProgressBar
                                        color="success"
                                        value={
                                          (100 -
                                            getPercent(
                                              Number(
                                                protocolSummary?.totalBorrowsUSD ||
                                                  0
                                              ),
                                              Number(
                                                protocolSummary?.totalCollateralUSD ||
                                                  0
                                              )
                                            )) /
                                          100
                                        }
                                        style={{
                                          background: "var(--ion-color-danger)",
                                          height: "0.2rem",
                                          marginTop: "0.25rem",
                                        }}
                                      ></IonProgressBar>
                                    </>
                                  )}

                                {(Number(
                                  protocolSummary?.totalCollateralUSD || 0
                                ) || 0) === 0 && (
                                  <>
                                    <IonText color="medium">
                                      <small>
                                        Deposit collateral to enable borrowing
                                        capacity
                                      </small>
                                      {/* <UseCrossChaineCollateralButton 
                                          onlyText={true}
                                          dismissPromptCrossModal={() => dismissPromptCrossModal(null, "enable-crosschain-collateral")}
                                          userSummaryAndIncentivesGroup={userSummaryAndIncentivesGroup||[]} /> */}
                                    </IonText>
                                  </>
                                )}
                              </div>
                            </IonItem>
                          </>
                        )}
                      </IonList>
                    </IonCol>
                  )}

                  <IonCol
                    size="12"
                    className="itemListDetails horizontalLineBottom ion-padding"
                  >
                    <IonLabel className="ion-padding-start ion-padding-top">
                      <b>
                        Pool APYs <ApyDetail isDisplayAPYDef={true} />
                      </b>
                    </IonLabel>
                    <IonList lines="none" className="ion-padding-vertical">
                      <IonItem lines="none">
                        <IonLabel>
                          Deposit APY
                          <IonText color="medium">
                            <small style={{ display: "block" }}>
                              Incentive rate that you earn
                            </small>
                          </IonText>
                        </IonLabel>
                        <IonText className="ion-color-gradient-text" slot="end">
                          <span
                            style={{ fontSize: "1.3rem", fontWeight: "bold" }}
                          >
                            {(Number(pool?.supplyAPY || 0) * 100).toFixed(2)}%
                          </span>
                        </IonText>
                      </IonItem>
                      {pool.borrowingEnabled &&
                        borrowPoolRatioInPercent < 99 && (
                          <IonItem lines="none">
                            <IonLabel>
                              Borrow APY
                              <IonText color={"medium"}>
                                <small style={{ display: "block" }}>
                                  Interest rate that you pay
                                </small>
                              </IonText>
                            </IonLabel>
                            <IonText
                              className="ion-color-gradient-text"
                              slot="end"
                            >
                              <span
                                style={{
                                  fontSize: "1.3rem",
                                  fontWeight: "bold",
                                }}
                              >
                                {(Number(pool?.borrowAPY || 0) * 100).toFixed(
                                  2
                                )}
                                %
                              </span>
                            </IonText>
                          </IonItem>
                        )}
                    </IonList>
                  </IonCol>

                  <IonCol
                    size="12"
                    className="itemListDetails horizontalLineBottom ion-padding"
                  >
                    <IonLabel className="ion-padding-start ion-padding-top">
                      <b>Pool informations</b>
                    </IonLabel>
                    <IonList lines="none" className="ion-padding-vertical">
                      <IonItem lines="none" className="ion-padding-bottom">
                        <IonLabel>Pool provider</IonLabel>
                        <div
                          slot="end"
                          className="ion-text-end"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            alignContent: "center",
                            justifyContent: "flex-end",
                          }}
                        >
                          <IonText className="ion-hide-sm-down">
                            AAVE V3
                            <small
                              style={{
                                display: "block",
                                color: "var(--ion-color-medium)",
                              }}
                            >
                              Lending & borrowing
                            </small>
                          </IonText>
                          <IonAvatar
                            style={{
                              height: "38px",
                              width: "38px",
                              minHeight: "38px",
                              minWidth: "38px",
                              marginLeft: "0.5rem",
                            }}
                          >
                            <IonImg
                              src={getAssetIconUrl({ symbol: "AAVE" })}
                            ></IonImg>
                          </IonAvatar>
                        </div>
                      </IonItem>
                      <div className="ion-padding-bottom">
                        <IonItem lines="none">
                          <IonLabel>Deposit liquidity</IonLabel>
                          <IonText slot="end">
                            {getReadableAmount(
                              valueToBigNumber(
                                pool.totalLiquidityUSD
                              ).toNumber()
                            )}
                          </IonText>
                        </IonItem>
                        <IonItem lines="none">
                          <IonLabel>Deposit capitalisation</IonLabel>
                          <IonText slot="end">
                            {getReadableAmount(Number(pool.supplyCapUSD))}
                          </IonText>
                        </IonItem>
                        <IonItem lines="none">
                          <IonLabel>Deposit pool usage</IonLabel>
                          <IonText slot="end">
                            {`${supplyPoolRatioInPercent.toFixed(2)}%`}
                          </IonText>
                        </IonItem>
                      </div>
                      {pool.borrowingEnabled && (
                        <>
                          <IonItem
                            lines="none"
                            style={{
                              "--background": "transparent",
                              marginTop: "0.5rem",
                            }}
                          >
                            <IonLabel>Debit liquidity</IonLabel>
                            <IonText>
                              {getReadableAmount(Number(pool.totalDebtUSD))}
                            </IonText>
                          </IonItem>
                          <IonItem
                            lines="none"
                            style={{ "--background": "transparent" }}
                          >
                            <IonLabel>Debit capitalisation</IonLabel>
                            <IonText>
                              {getReadableAmount(Number(pool.borrowCapUSD))}
                            </IonText>
                          </IonItem>
                          <IonItem lines="none">
                            <IonLabel>Debit pool usage</IonLabel>
                            <IonText slot="end">
                              {`${borrowPoolRatioInPercent.toFixed(2)}%`}
                            </IonText>
                          </IonItem>
                        </>
                      )}
                    </IonList>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
      {isMobilePWADevice && (
        <IonFooter>
          <IonToolbar style={{'--background': 'transparent'}}>
            {callActionsBtn}
          </IonToolbar>
        </IonFooter>
      )}

      <IonModal
        className="modalAlert"
        onIonModalDidDismiss={() => {}}
        keyboardClose={false}
        isOpen={isModalOptionsOpen}
        onDidDismiss={() => {
          setIsModalOptionsOpen(false);
        }}
      >
        <IonGrid
          className="ion-padding"
          style={{ width: "100%" }}
        >
          <IonRow>
            <IonCol>
              <IonText>
                <h3 style={{ marginBottom: 0 }}>
                  <b>Select option</b>
                </h3>
              </IonText>
              <IonText color="medium">
                <p className="ion-no-margin">
                  <small>
                    Choose an option to interact with this
                    pool.
                  </small>
                </p>
              </IonText>
            </IonCol>
            <IonCol size="12">
              {/* {ExchangeAssetBtn}
              {BuyAssetBtn} */}
              {WithdrawBtn}
              {DepositBtn}
              {RepayBtn}
              {BorrowBtn}
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonModal>
      
      <IonModal
        className="modalAlert"
        onIonModalDidDismiss={() => {
          setIsModalOpen(false);
          setIsCrossChain(false);
        }}
        keyboardClose={false}
        isOpen={isModalOpen}
      >
        <LoanFormModal
          selectedPool={{
            pool: {
              ...pool,
              walletBalance,
              supplyBalance,
              borrowBalance,
              poolLiquidationThreshold,
              userLiquidationThreshold,
            } as AavePool,
            actionType: state?.actionType || "deposit",
            userSummary: userSummary as IUserSummary,
          }}
          isCrossChain={isCrossChain}
          onDismiss={async (data, role) => {
            console.log({ data, role });
            setIsModalOpen(false);
            await onDismiss({
              detail: {
                data,
                role,
              },
            } as CustomEvent<OverlayEventDetail>)
              .then(async () => {
                if (!data || role === "cancel") {
                  return;
                }
                await hideLoader();
                console.log("[INFO] ReserveDetail - onDismiss: ", data, role);
                // display success message
                presentSuccess({
                  cssClass: "modalAlert",
                });
              })
              .catch(async (error) => {
                await hideLoader();
                console.log("[ERROR] ReserveDetail - onDismiss: ", error);
                // display toast
                present({
                  message: error?.message ? `${error.message}` : `${error}`,
                  color: "danger",
                  duration: 5000,
                  buttons: [
                    {
                      text: "x",
                      role: "cancel",
                      handler: () => {
                        dismissToast();
                      },
                    },
                  ],
                });
              });
            setIsCrossChain(false);
          }}
        />
      </IonModal>
    </>
  );
}
