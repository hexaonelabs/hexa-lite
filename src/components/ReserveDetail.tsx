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
  IReserve,
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

interface IReserveDetailProps {
  reserve: IReserve;
  userSummary: IUserSummary | undefined;
  markets: MARKETTYPE | undefined;
  dismiss: () => void;
  handleSegmentChange: (e: { detail: { value: string } }) => void;
}

export function ReserveDetail(props: IReserveDetailProps) {
  const {
    reserve: { id, chainId },
    userSummary,
    markets,
    handleSegmentChange,
  } = props;
  const { web3Provider, switchNetwork, currentNetwork, walletAddress } = useWeb3Provider();
  const { userSummaryAndIncentivesGroup } = useAave();
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
            <UseCrossChaineCollateralButton 
              dismissPromptCrossModal={() => dismissPromptCrossModal(null, "enable-crosschain-collateral")}
              userSummaryAndIncentivesGroup={userSummaryAndIncentivesGroup||[]} />
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
  const { refresh, poolGroups } = useAave();
  const modal = useRef<HTMLIonModalElement>(null);
  const [isCrossChain, setIsCrossChain] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOptionsOpen, setIsModalOptionsOpen] = useState(false);

  // find reserve in `poolGroups[*].reserves` by `reserveId`
  const reserve = useMemo(() => {
    return poolGroups
      ?.find((pg) => pg.reserves.find((r) => r.id === id))
      ?.reserves.find((r) => r.id === id) as IReserve;
  }, [id, poolGroups]);
  const borrowPoolRatioInPercent = getPercent(
    valueToBigNumber(reserve.totalDebtUSD).toNumber(),
    valueToBigNumber(reserve.borrowCapUSD).toNumber()
  );
  const supplyPoolRatioInPercent = getPercent(
    valueToBigNumber(reserve.totalLiquidityUSD).toNumber(),
    valueToBigNumber(reserve.supplyCapUSD).toNumber()
  );
  const percentBorrowingCapacity =
    100 -
    getPercent(
      Number(userSummary?.totalBorrowsUSD || 0),
      Number(userSummary?.totalCollateralUSD)
    );

  const handleOpenModal = (
    type: ReserveDetailActionType,
    reserve: IReserve
  ) => {
    if (!userSummary) {
      throw new Error("No userSummary found");
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
    const provider =
      currentNetwork !== reserve.chainId
        ? await switchNetwork(reserve.chainId)
        : web3Provider;
    if (!provider) {
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
          throw new Error("Invalid amount. Value must be greater than 0.");
        }
        // call method
        const params = {
          provider: (provider as ethers.providers.Web3Provider),
          reserve,
          amount: amount.toString(),
          onBehalfOf: undefined,
          poolAddress: `${markets?.POOL}`,
          gatewayAddress: `${markets?.WETH_GATEWAY}`,
        };
        console.log("params: ", params);
        try {
          const txReceipts = await supplyWithPermit(params);
          console.log("TX result: ", txReceipts);
        } catch (error) {
          throw error;
        }
        break;
      }
      case type === "withdraw": {
        const value = ev.detail.data;
        const amount = Number(value);
        // handle invalid amount
        if (isNaN(amount) || amount <= 0) {
          throw new Error("Invalid amount. Value must be greater than 0.");
        }
        // call method
        const params = {
          provider: (provider as ethers.providers.Web3Provider),
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
        } catch (error) {
          throw error;
        }
        break;
      }
      case type === "borrow": {
        const value = ev.detail.data;
        const amount = Number(value);
        // handle invalid amount
        if (isNaN(amount) || amount <= 0) {
          throw new Error("Invalid amount. Value must be greater than 0.");
        }
        // call method
        const params = {
          provider: (provider as ethers.providers.Web3Provider),
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
        } catch (error) {
          throw error;
        }
        break;
      }
      case type === "repay": {
        const value = ev.detail.data;
        const amount = Number(value);
        // handle invalid amount
        if (isNaN(amount) || amount <= 0) {
          throw new Error("Invalid amount. Value must be greater than 0.");
        }
        // call method
        const params = {
          provider: (provider as ethers.providers.Web3Provider),
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
          // await hideLoader();
          // await refresh();
        } catch (error) {
          console.log("[ERROR]: ", error);
          // await hideLoader();
          // await refresh();
          throw error;
        }
        break;
      }
      default:
        break;
    }
    // update Pool data by update context
    await refresh("userSummary");
  };


  const BuyAssetBtn = walletAddress && +(reserve.walletBalance || 0) <= 0 && reserve.supplyBalance <= 0 
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
      Buy {reserve.symbol}
    </IonButton>)
  : (<></>);

  const ExchangeAssetBtn = walletAddress && +(reserve.walletBalance || 0) <= 0 && reserve.supplyBalance <= 0
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

  const WithdrawBtn = walletAddress && (reserve?.supplyBalance || +reserve.supplyBalance > 0)
    ? (<IonButton
      fill="solid"
      expand="block"
      color="gradient"
      onClick={() => {
        setIsModalOptionsOpen(()=> false);
        handleOpenModal("withdraw", reserve);
      }}
    >
      Withdraw deposit
    </IonButton>
    ) : (<></>);

  const DepositBtn = walletAddress && (reserve?.walletBalance||0) > 0 && (supplyPoolRatioInPercent < 99)
    ? (<IonButton
        fill="solid"
        expand="block"
        color="gradient"
        onClick={() => {
          setIsModalOptionsOpen(()=> false);
          handleOpenModal("deposit", reserve);
        }}
      >
        Deposit {reserve.symbol} as collateral
      </IonButton>)
    : (<></>);

  const RepayBtn = walletAddress && (reserve?.borrowBalance || +reserve.borrowBalance > 0)
      ? (<IonButton
          fill="solid"
          expand="block"
          color="gradient"
          onClick={() => {
            setIsModalOptionsOpen(()=> false);
            handleOpenModal("repay", reserve);
          }}
        >
          Repay loan
        </IonButton>)
      : (<></>);

  const BorrowBtn = walletAddress && reserve.borrowingEnabled && (borrowPoolRatioInPercent < 99)
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
                    handleOpenModal("borrow", reserve);
                  }
                });
                return;
              }
              handleOpenModal("borrow", reserve);
            }}
          >
            Borrow {reserve.symbol}
          </IonButton>)
        : (<></>);  

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
                      symbol={reserve?.symbol}
                      chainId={reserve?.chainId}
                      iconSize="124px"
                    />
                    <div className="ion-padding-start ion-hide-sm-down">
                      <h2>
                        {reserve?.symbol}
                        <IonText color="medium">
                          <small style={{ display: "block" }}>
                            {
                              CHAIN_AVAILABLES.find(
                                (c) => c.id === reserve.chainId
                              )?.name
                            }{" "}
                            network
                          </small>
                        </IonText>
                      </h2>
                      {(reserve?.usageAsCollateralEnabled === false ||
                        reserve.isIsolated === true) && (
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
                                {ExchangeAssetBtn}
                                {BuyAssetBtn}
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

            {!reserve.usageAsCollateralEnabled && (
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

            {reserve.isIsolated === true && (
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
            )}

            <IonCol size="12" size-md="12" className="ion-no-padding">
              <IonGrid className="ion-no-padding">
                <IonRow className="ion-align-items-center ion-no-padding">
                  {walletAddress && (
                    <IonCol
                      size="12"
                      className="itemListDetails horizontalLineBottom ion-padding"
                    >
                      <IonLabel className="ion-padding-start ion-padding-top">
                        My positions
                      </IonLabel>
                      <IonList lines="none" className="ion-padding-vertical">
                        <IonItem>
                          <IonLabel color="medium">
                            Deposit
                          </IonLabel>

                          <div className="ion-text-end">
                            <IonText style={{ fontSize: "1rem" }}>
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
                        {reserve.borrowingEnabled && (
                          <>
                            <IonItem>
                              <IonLabel color="medium" className="ion-padding-vertical">
                                Debit
                              </IonLabel>

                              <div className="ion-text-end">
                                <IonText style={{ fontSize: "1rem" }}>
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
                            <IonItem>
                              <IonLabel color="medium">
                                Borrowing capacity
                              </IonLabel>
                              <div slot="end" className="ion-text-end">
                                {userSummary &&
                                  (+userSummary?.availableBorrowsUSD || 0) > 0 && (
                                    <>
                                      <IonText color="dark">
                                        {currencyFormat(
                                          +(userSummary?.totalBorrowsUSD || 0)
                                        )}{" "}
                                        of{" "}
                                        {currencyFormat(
                                          Number(userSummary?.totalCollateralUSD) *
                                            Number(
                                              userSummary?.currentLiquidationThreshold
                                            )
                                        )}{" "}
                                      </IonText>
                                      <IonProgressBar
                                        color="success"
                                        value={
                                          (100 -
                                            getPercent(
                                              +userSummary.totalBorrowsUSD,
                                              +userSummary.totalCollateralUSD
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
                                
                                {(Number(userSummary?.availableBorrowsUSD) || 0) === 0 && (
                                    <>
                                      <IonText>
                                        Deposit collateral to enable borrowing capacity 
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
                      Pool APYs <ApyDetail isDisplayAPYDef={true} />
                    </IonLabel>
                    <IonList lines="none" className="ion-padding-vertical">
                      <IonItem>
                        <IonLabel color="medium">
                          Deposit APY
                          <small style={{display: 'block'}}>
                            Incentive rate that you earn
                          </small>
                        </IonLabel>
                        <IonText slot="end">
                          <span style={{ fontSize: "1.3rem" }}>
                            {(Number(reserve?.supplyAPY || 0) * 100).toFixed(2)}
                            %
                          </span>
                        </IonText>
                      </IonItem>
                      {reserve.borrowingEnabled && (borrowPoolRatioInPercent < 99) && (
                        <IonItem>
                          <IonLabel color="medium">
                            Borrow APY
                            <small style={{display: 'block'}}>
                              Interest rate that you pay
                              </small>
                          </IonLabel>
                          <IonText slot="end">
                            <span style={{ fontSize: "1.3rem" }}>
                              {(
                                Number(reserve?.variableBorrowAPY || 0) * 100
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
                      Pool informations
                    </IonLabel>
                    <IonList lines="none" className="ion-padding-vertical">
                      <IonItem>
                        <IonLabel color="medium">Pool provider</IonLabel>
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
                      <IonItem>
                        <IonLabel color="medium">Deposit liquidity</IonLabel>
                        <IonText slot="end">
                          {getReadableAmount(
                            valueToBigNumber(
                              reserve.totalLiquidityUSD
                            ).toNumber()
                          )}
                        </IonText>
                      </IonItem>
                      <IonItem>
                        <IonLabel color="medium">
                          Deposit capitalisation
                        </IonLabel>
                        <IonText slot="end">
                          {getReadableAmount(Number(reserve.supplyCapUSD))}
                        </IonText>
                      </IonItem>
                      <IonItem>
                        <IonLabel color="medium">Deposit pool usage</IonLabel>
                        <IonText slot="end">
                          {`${supplyPoolRatioInPercent.toFixed(2)}%`}
                        </IonText>
                      </IonItem>
                      {reserve.borrowingEnabled && (
                        <>
                          <IonItem style={{ "--background": "transparent" }}>
                            <IonLabel color="medium">Debit liquidity</IonLabel>
                            <IonText>
                              {getReadableAmount(Number(reserve.totalDebtUSD))}
                            </IonText>
                          </IonItem>
                          <IonItem
                            lines="none"
                            style={{ "--background": "transparent" }}
                          >
                            <IonLabel color="medium">
                              Debit capitalisation
                            </IonLabel>
                            <IonText>
                              {getReadableAmount(Number(reserve.borrowCapUSD))}
                            </IonText>
                          </IonItem>
                          <IonItem>
                            <IonLabel color="medium">Debit pool usage</IonLabel>
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
          selectedReserve={{
            reserve,
            actionType: state?.actionType || "deposit",
          }}
          isCrossChain={isCrossChain}
          userSummary={userSummary as IUserSummary}
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
