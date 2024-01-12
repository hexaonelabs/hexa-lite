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
import ConnectButton from "./ConnectButton";
import { LoanFormModal } from "./LoanFormModal";
import { useMemo, useRef, useState } from "react";
import { closeOutline, warningOutline, closeSharp } from "ionicons/icons";
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
import { useWeb3Provider } from "../context/Web3Context";
import { useLoader } from "../context/LoaderContext";
import { useAave } from "../context/AaveContext";
import { getAssetIconUrl } from "../utils/getAssetIconUrl";
import { SymbolIcon } from "./SymbolIcon";
import { currencyFormat } from "../utils/currency-format";
import { ApyDetail } from "./ApyDetail";
import { UseCrossChaineCollateralButton } from "./UseCrossChainCollateralBtn";
import { AavePool, IAavePool } from "@/pool/Aave.pool";
import { usePools } from "@/context/PoolContext";
import { MarketPool } from "@/pool/Market.pool";
import { A } from "@bgd-labs/aave-address-book/dist/AaveV2EthereumAMM-aAo4xAj8";

interface IReserveDetailProps {
  pool: MarketPool;
  markets: MARKETTYPE | undefined;
  dismiss: () => void;
  handleSegmentChange: (e: { detail: { value: string } }) => void;
}

export function ReserveDetail(props: IReserveDetailProps) {
  const {
    pool: { id, chainId },
    markets,
    handleSegmentChange,
  } = props;
  const { web3Provider, switchNetwork, currentNetwork, walletAddress } = useWeb3Provider();
  const [present, dismiss] = useIonToast();
  const [presentAlert] = useIonAlert();
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
  const [state, setState] = useState<
    | {
        actionType: ReserveDetailActionType;
      }
    | undefined
  >(undefined);
  const { refresh, poolGroups, userSummaryAndIncentivesGroup } = usePools();
  const modal = useRef<HTMLIonModalElement>(null);
  const [isCrossChain, setIsCrossChain] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOptionsOpen, setIsModalOptionsOpen] = useState(false);

  // find pool in `poolGroups[*].pool` by `poolId`
  const poolGroup = poolGroups
    .find(({pools}) => pools.find((p) => p.id === id));
  if (!poolGroup) {
    throw new Error("No poolGroup found");
  }
  
  const userSummary = userSummaryAndIncentivesGroup?.find(
    group => group.userReservesData.find(({reserve}) => reserve.id === id)
  );
  const pool = useMemo(() => {
    return poolGroup.pools.find((r) => r.id === id);
  }, [id, poolGroups]);

  if (!pool) {
    throw new Error("No pool found");
  }

  const protocolSummary = poolGroups
  .flatMap(({pools})=> pools)
  .filter((p) => p.chainId === pool.chainId && p.provider === pool.provider)
  .reduce((acc, p) => {
    return {
      ...acc,
      totalSupplyBalance: acc.totalSupplyBalance + p.supplyBalance,
      totalBorrowBalance: acc.totalBorrowBalance + p.borrowBalance,
      pools: [...acc.pools, p],
    };
  }, {
    provider: pool.provider,
    chainId: pool.chainId,
    pools: [] as IMarketPool[],
  } as IProtocolSummary);

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
      protocolSummary.totalBorrowBalance,
      protocolSummary.totalSupplyBalance
    );

  const handleOpenModal = (
    type: ReserveDetailActionType,
  ) => {
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
    if (!web3Provider) {
      throw new Error("No web3Provider found");
    }
    if (!(web3Provider instanceof ethers.providers.Web3Provider)) {
      throw new Error("No EVM web3Provider");
    }
    if (ev.detail.role !== "confirm") {
      return;
    }
    displayLoader();
    // switch network if need
    let provider = web3Provider;
    if (currentNetwork !== pool.chainId) {
      await switchNetwork(pool.chainId);
      // update provider after switch network
      provider = web3Provider;
    }
    if (!provider) {
      throw new Error("No provider found or update failed");
    }
    // perform action
    const type = state?.actionType;        
    const value = ev.detail.data;
    const amount = Number(value);
    switch (true) {
      case type === "deposit": {
        await pool.deposit(amount, provider);
        break;
      }
      case type === "withdraw": {
        await pool.withdraw(amount, provider);
        break;
      }
      case type === "borrow": {
        await pool.borrow(amount, provider);
        break;
      }
      case type === "repay": {
        await pool.repay(amount, provider);
        break;
      }
      default:
        break;
    }
    // update Pool data by update context
    await refresh("userSummary");
  };

  const BuyAssetBtn = walletAddress && +(pool.walletBalance || 0) <= 0 && pool.supplyBalance <= 0 
    ? (<IonButton
      fill="solid"
      expand="block"
      color="gradient"
      onClick={() =>{
        setIsModalOptionsOpen(()=> false);
        handleSegmentChange({
          detail: { value: "fiat" },
        })
      }}
    >
      Buy {pool.symbol}
    </IonButton>)
  : (<></>);

  const ExchangeAssetBtn = walletAddress && +(pool.walletBalance || 0) <= 0 && pool.supplyBalance <= 0
      ? (<IonButton
        fill="solid"
        expand="block"
        color="gradient"
        onClick={() => {
          setIsModalOptionsOpen(()=> false);
          handleSegmentChange({
            detail: { value: "swap" },
          });
        }}
      >
        Exchange assets
      </IonButton>)
      : (<></>);

  const WithdrawBtn = walletAddress && (pool?.supplyBalance || +pool.supplyBalance > 0)
    ? (<IonButton
      fill="solid"
      expand="block"
      color="gradient"
      onClick={() => {
        setIsModalOptionsOpen(()=> false);
        handleOpenModal("withdraw");
      }}
    >
      Withdraw
    </IonButton>
    ) : (<></>);

  const DepositBtn = walletAddress && (pool?.walletBalance||0) > 0 && (supplyPoolRatioInPercent < 99)
    ? (<IonButton
        fill="solid"
        expand="block"
        color="gradient"
        onClick={() => {
          setIsModalOptionsOpen(()=> false);
          handleOpenModal("deposit");
        }}
      >
        Deposit {pool.symbol} as collateral
      </IonButton>)
    : (<IonButton
      fill="solid"
      expand="block"
      color="gradient"
      disabled={true} >Deposit {pool.symbol} as collateral</IonButton>);

  const RepayBtn = walletAddress && (pool?.borrowBalance || +pool.borrowBalance > 0)
      ? (<IonButton
          fill="solid"
          expand="block"
          color="gradient"
          onClick={() => {
            setIsModalOptionsOpen(()=> false);
            handleOpenModal("repay");
          }}
        >
          Repay loan
        </IonButton>)
      : (<></>);

  const BorrowBtn = walletAddress && pool.borrowingEnabled && (borrowPoolRatioInPercent < 99)
        ? (<IonButton
            fill="solid"
            color="gradient"
            expand="block"
            onClick={() => {
              setIsModalOptionsOpen(()=> false);
              if (borrowPoolRatioInPercent > 99.9) {
                presentAlert({
                  header: "Information",
                  message: "Borrowing capacity is over. Add more collaterals to enable borrowing.",
                  buttons: [{ text: "OK", cssClass: "gradient"}],
                });
                return;
              }
              if (percentBorrowingCapacity <= 0) {
                presentPomptCrossModal({
                  cssClass: ['modalAlert'],
                  onDidDismiss: ({detail: {data, role}= {}}) => {
                    if (role !== 'enable-crosschain-collateral') {
                      return;
                    }
                    // handle cross-chain collateral request
                    console.log("onDidDismiss: ", {data, role});
                    setIsCrossChain(()=> true);
                    handleOpenModal("borrow");
                  }
                });
                return;
              }
              handleOpenModal("borrow");
            }}
          >
            Borrow {pool.symbol}
          </IonButton>)
        : (<IonButton
          fill="solid"
          color="gradient"
          expand="block"
          disabled={true}>
            Borrow {pool.symbol}
          </IonButton>);  

  return (
    <>
      <IonContent fullscreen={true} className="ion-padding">
        <IonButtons className="ion-float-end">
          <IonButton
            color="primary"
            size="large"
            onClick={() => props.dismiss()}
          >
            <IonIcon icon={closeOutline}></IonIcon>
          </IonButton>
        </IonButtons>
        <div
          className="ion-padding ion-text-center"
          style={{
            width: "100%",
            maxWidth: "800px",
            margin: "0rem auto 0",
          }}
        >
          <h2>Loan market details</h2>
        </div>
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
                    size-md="6"
                    class="ion-text-start ion-padding"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      alignContent: "center",
                    }}
                  >
                    <SymbolIcon
                      symbol={pool?.symbol}
                      chainId={pool?.chainId}
                      assetIconURL={pool?.logo}
                      iconSize="124px"
                    />
                    <div className="ion-padding-start ion-hide-sm-down">
                      <h2>
                        <b>
                          {pool?.symbol}
                        </b>
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
                      {pool.usageAsCollateralEnabled === false  && (
                        <IonIcon
                          icon={warningOutline}
                          color="warning"
                          style={{ marginLeft: "0.5rem" }}
                        ></IonIcon>
                      )}
                    </div>
                  </IonCol>
                  <IonCol size-md="6" className="ion-text-end">
                    {walletAddress ? (
                      <>
                        <IonButton color="gradient" onClick={()=> {
                          setIsModalOptionsOpen(()=> true);
                        }}>
                          Choose option
                        </IonButton>
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
                                  <h3 style={{marginBottom: 0}}>
                                    <b>Select option</b>
                                  </h3>
                                </IonText>
                                <IonText color="medium">
                                  <p className="ion-no-margin">
                                    <small>
                                      Choose an option to interact with this pool.
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
                      </>
                    ) : (
                      <ConnectButton></ConnectButton>
                    )}
                  </IonCol>
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
                        <b>
                          My positions
                        </b>
                      </IonLabel>
                      <IonList lines="none" className="ion-padding-vertical">
                        <IonItem lines="none">
                          <IonLabel>
                            Deposit
                          </IonLabel>

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
                              <IonLabel>
                                Borrowing capacity
                              </IonLabel>
                              <div slot="end" className="ion-text-end">
                                {poolGroup &&
                                  (+protocolSummary.totalSupplyBalance ) > 0 && (
                                    <>
                                      <IonText color="dark">
                                        {currencyFormat(
                                          +(protocolSummary.totalSupplyBalance || 0)
                                        )}{" "}
                                        of{" "}
                                        {currencyFormat(
                                          Number(protocolSummary?.totalSupplyBalance) *
                                            Number(
                                              protocolSummary.totalUserLiquidationThreshold / protocolSummary.pools.length
                                            )
                                        )}{" "}
                                      </IonText>
                                      <IonProgressBar
                                        color="success"
                                        value={
                                          (100 -
                                            getPercent(
                                              protocolSummary.totalBorrowBalance,
                                              protocolSummary.totalSupplyBalance
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
                                
                                {(Number(protocolSummary.totalSupplyBalance) || 0) === 0 && (
                                    <>
                                      <IonText color="medium">
                                        <small>
                                          Deposit collateral to enable borrowing capacity 
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
                            <small style={{display: 'block'}}>
                              Incentive rate that you earn
                            </small>
                          </IonText>
                        </IonLabel>
                        <IonText className="ion-color-gradient-text" slot="end">
                          <span style={{ fontSize: "1.3rem", fontWeight: 'bold' }}>
                            {(Number(pool?.supplyAPY || 0) * 100).toFixed(2)}
                            %
                          </span>
                        </IonText>
                      </IonItem>
                      {pool.borrowingEnabled && (borrowPoolRatioInPercent < 99) && (
                        <IonItem lines="none">
                          <IonLabel>
                            Borrow APY
                            <IonText color={"medium"}>
                              <small style={{display: 'block'}}>
                                Interest rate that you pay
                                </small>
                            </IonText>
                          </IonLabel>
                          <IonText className="ion-color-gradient-text" slot="end">
                            <span style={{ fontSize: "1.3rem", fontWeight: 'bold' }}>
                              {(
                                Number(pool?.borrowAPY || 0) * 100
                              ).toFixed(2)}
                              %
                            </span>
                          </IonText>
                        </IonItem>
                      ) }
                    </IonList>
                  </IonCol>

                  <IonCol
                    size="12"
                    className="itemListDetails horizontalLineBottom ion-padding"
                  >
                    <IonLabel className="ion-padding-start ion-padding-top">
                      <b>
                        Pool informations
                      </b>
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
                          <IonLabel>
                            Deposit capitalisation
                          </IonLabel>
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
                          <IonItem lines="none" style={{ "--background": "transparent", marginTop: '0.5rem' }}>
                            <IonLabel>Debit liquidity</IonLabel>
                            <IonText>
                              {getReadableAmount(Number(pool.totalDebtUSD))}
                            </IonText>
                          </IonItem>
                          <IonItem
                            lines="none"
                            style={{ "--background": "transparent" }}
                          >
                            <IonLabel>
                              Debit capitalisation
                            </IonLabel>
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

      <IonModal
        ref={modal}
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
            pool: pool as AavePool,
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
                // display toast
                present({
                  message: `Transaction success`,
                  color: "success",
                  duration: 5000,
                  buttons: [
                    {
                      text: "x",
                      role: "cancel",
                      handler: () => {
                        dismiss();
                      },
                    },
                  ],
                });
              })
              .catch(async (error) => {
                await hideLoader();
                console.log("[ERROR] ReserveDetail - onDismiss: ", error);
                // display toast
                present({
                  message: `${error}`,
                  color: "danger",
                  duration: 5000,
                  buttons: [
                    {
                      text: "x",
                      role: "cancel",
                      handler: () => {
                        dismiss();
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
