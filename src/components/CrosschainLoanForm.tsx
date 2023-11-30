import {
  IonButton,
  IonCol,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonPopover,
  IonRow,
  IonSkeletonText,
  IonText,
  useIonToast,
} from "@ionic/react";
import { IonInputCustomEvent, InputInputEventDetail } from "@ionic/core";
import { ethers } from "ethers";
import { CHAIN_AVAILABLES } from "../constants/chains";
import {
  LiFiQuoteResponse,
  checkAndSetAllowance,
  fakeQuote,
  getQuote,
  sendTransaction,
} from "../servcies/lifi.service";
import { chevronDown } from "ionicons/icons";
import { SymbolIcon } from "./SymbolIcon";
import { useEffect, useRef, useState } from "react";
import { useAave } from "../context/AaveContext";
import { getReadableAmount } from "../utils/getReadableAmount";
import { getMaxAmount } from "../utils/getMaxAmount";
import { IReserve, IUserSummary } from "../interfaces/reserve.interface";
import {
  calculateHealthFactorFromBalancesBigUnits,
  valueToBigNumber,
} from "@aave/math-utils";
import { useWeb3Provider } from "../context/Web3Context";
import { getPercent } from "../utils/utils";
import { WarningBox } from "./WarningBox";
import { DangerBox } from "./DangerBox";
import { useLoader } from "../context/LoaderContext";

const isNumberKey = (evt: React.KeyboardEvent<HTMLIonInputElement>) => {
  var charCode = (evt.which) ? evt.which : evt.keyCode
  return !(charCode > 31 && (charCode < 48 || charCode > 57));
}

const requestQuote = async (ops: {
  web3Provider: ethers.providers.Web3Provider;
  selectedCollateral: Pick<
    IReserve,
    "chainId" | "aTokenAddress" | "decimals" | "priceInUSD"
  >;
  newCollateral: Pick<IReserve, "chainId" | "aTokenAddress" | "priceInUSD">;
  inputFromAmount: number;
}): Promise<LiFiQuoteResponse & { errors?: any; message?: string }> => {
  const {
    web3Provider,
    selectedCollateral,
    newCollateral,
    inputFromAmount,
  } = ops;
  const amountInWei = ethers.utils
    .parseUnits(
      inputFromAmount.toString() || "0",
      selectedCollateral?.decimals || 18
    )
    .toString();
  console.log("[INFO] CrosschainLoanForm requestQuote...", ops);
  const fromAddress = (await web3Provider?.getSigner().getAddress()) || "";
  // return {...fakeQuote, estimate: {
  //   ...fakeQuote.estimate,
  //   toAmount: `${(Number(inputFromAmount||0) * Number(selectedCollateral.priceInUSD)) / Number(newCollateral.priceInUSD)}`
  // }};
  // return {
  //   message:"No available quotes for the requested transfer",
  //   errors:{
  //     filteredOut:[],
  //     failed:[]
  //   }
  // } as any;
  try {
    // working pool: 0x625e7708f30ca75bfd92586e17077590c60eb4cd
    // chainId: [137, 10]
    const quote = await getQuote(
      selectedCollateral.chainId.toLocaleString(),
      newCollateral.chainId.toLocaleString(),
      selectedCollateral.aTokenAddress,
      newCollateral.aTokenAddress,
      amountInWei,
      fromAddress
    );
    console.log("[INFO] CrosschainLoanForm requestQuote: ", {
      quote,
      amountInWei,
    });
    return quote;
  } catch (error: Error | any) {
    return {
      errors: error,
      message:
        error?.message || "No available quotes for the requested transfer",
    } as any;
  }
};

/**
 * Calculate amount ratio of `collateral.reserveLiquidationThreshold` asset
 * user can borrow from `reserve` asset based on `quoteEstimateToAmount`
 * @param ops
 * @returns
 */
const getBorrowAvailableAmountOfReserve = (ops: {
  collateral: IReserve;
  reserve: IReserve;
  quoteEstimateToAmount: number;
}) => {
  const { collateral, reserve, quoteEstimateToAmount } = ops;
  const percentThreshold =
    Number(collateral.reserveLiquidationThreshold) / 10000 - 0.05;
  const collateralAmount =
    Number(quoteEstimateToAmount || 0) * percentThreshold;
  const collateralAmountUSD = collateralAmount * Number(collateral.priceInUSD);
  return collateralAmountUSD / Number(reserve.priceInUSD);
};

export function CrosschainLoanForm(props: {
  reserve: IReserve;
  userSummary: IUserSummary;
  toggleCrosschainForm: () => void;
  onSubmit:(data?: string | null | undefined | number, role?:  "confirm" | "cancel") => void;
}) {
  const { reserve, userSummary, toggleCrosschainForm, onSubmit } = props;
  const { userSummaryAndIncentivesGroup, poolGroups } = useAave();
  const { web3Provider, assets } = useWeb3Provider();
  const [healthFactor, setHealthFactor] = useState<number | undefined>(
    +userSummary.healthFactor
  );
  const [inputFromAmount, setInputFromAmount] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();  
  const toastContext = useIonToast();
  const presentToast = toastContext[0];
  const dismissToast = toastContext[1];

  const collateralPoolsGroup = (userSummaryAndIncentivesGroup || [])
    .filter((group) => Number(group.availableBorrowsUSD) > 0)
    .map((group) =>
      group.userReservesData
        .filter(({ underlyingBalanceUSD }) => Number(underlyingBalanceUSD) > 0)
        .map(({ reserve }) => ({
          ...reserve,
          chainId: group.chainId,
          balance:
            assets?.find(
              (a) =>
                a.contractAddress?.toLocaleLowerCase() ===
                  reserve.aTokenAddress.toLocaleLowerCase() &&
                a?.chain?.id === group.chainId
            )?.balance || -1,
        }))
    )
    .flat();
  const [selectedCollateral, setSelectedCollateral] = useState(
    collateralPoolsGroup?.[0]
  );
  const [newCollateral, setNewCollateral] = useState(
    (poolGroups || [])
      ?.filter((p) => p.chainIds.includes(reserve.chainId))
      ?.flatMap((p) => p.reserves)
      ?.filter((r) => r.chainId === reserve.chainId)[0]
  );
  const [newCollateralAmount, setNewCollateralAmount] = useState(0);
  const [borrowAmount, setBorrowAmount] = useState(0);
  const [quote, setQuote] = useState<LiFiQuoteResponse>();
  // boolean state to manage loader UI during request and calculate process
  const [isLoading, setIsLoading] = useState(false);
  const { display: displayLoader, hide: hideLoader } = useLoader();

  const depositPoolsGroup = (poolGroups || [])
    ?.filter((p) => p.chainIds.includes(reserve.chainId))
    ?.flatMap((p) => p.reserves)
    ?.filter(
      (r) =>
        r.chainId === reserve.chainId &&
        !r.isIsolated &&
        getPercent(
          valueToBigNumber(r.totalLiquidityUSD).toNumber(),
          valueToBigNumber(r.supplyCapUSD).toNumber()
        ) < 99
    );
  const maxAmount = selectedCollateral?.id
    ? getMaxAmount(
        "withdraw",
        poolGroups
          ?.map((p) => p.reserves.find((r) => r.id === selectedCollateral.id))
          .filter(Boolean)[0] as IReserve,
        userSummaryAndIncentivesGroup?.find((summary) =>
          summary.userReservesData.find(
            (r) => r.reserve.id === selectedCollateral.id
          )
        ) as any,
        selectedCollateral.chainId
      )
    : 0;
  const displayRiskCheckbox =
    healthFactor && healthFactor < 1.15 && healthFactor?.toString() !== "-1";

  const handleInputChange = async (
    e: IonInputCustomEvent<InputInputEventDetail>
  ) => {
    let value = Number((e.target as any).value || 0);
    if (maxAmount && value > maxAmount) {
      (e.target as any).value = maxAmount;
      value = maxAmount;
    }
    if (value <= 0) {
      setErrorMessage(() => undefined);
      setNewCollateralAmount(() => 0);
      setBorrowAmount(() => 0);
      setHealthFactor(() => undefined);
      // UI loader control
      setIsLoading(() => false);
      return;
    }
    const summary = userSummaryAndIncentivesGroup?.find((summary) =>
      summary.userReservesData.find(
        (r) => r.reserve.id === selectedCollateral?.id
      )
    );
    if (!summary || !selectedCollateral) {
      setErrorMessage(() => undefined);
      setInputFromAmount(() => 0);
      setNewCollateralAmount(() => 0);
      setBorrowAmount(() => 0);
      setHealthFactor(() => undefined);
      // UI loader control
      setIsLoading(() => false);
      return;
    }
    const newHealthFactor = calculateHealthFactorFromBalancesBigUnits({
      collateralBalanceMarketReferenceCurrency: summary.totalCollateralUSD,
      borrowBalanceMarketReferenceCurrency: valueToBigNumber(
        summary.totalBorrowsUSD
      ).plus(
        valueToBigNumber(value || 0).times(selectedCollateral?.priceInUSD || 0)
      ),
      currentLiquidationThreshold: summary.currentLiquidationThreshold,
    });
    if (!web3Provider) {
      // UI loader control
      setIsLoading(() => false);
      throw new Error("No ethereum provider");
    }
    // UI loader control
    setIsLoading(() => true);
    // request Quote
    const { errors, message, ...quote } = await requestQuote({
      web3Provider: web3Provider as ethers.providers.Web3Provider,
      inputFromAmount: value,
      newCollateral,
      selectedCollateral,
    });
    if (errors || !quote?.estimate) {
      setHealthFactor(() => undefined);
      setErrorMessage(() => message);
      setInputFromAmount(() => value);
      setQuote(() => undefined);
      setNewCollateralAmount(() => 0);
      setBorrowAmount(() => 0);
      // UI loader control
      setIsLoading(() => false);
      return;
    }
    const estimateToAmountDecimal = ethers.utils.formatUnits(
      quote.estimate.toAmount,
      newCollateral.decimals
    );
    const borrowAvailableAmountOfReserve = getBorrowAvailableAmountOfReserve({
      collateral: newCollateral,
      reserve,
      quoteEstimateToAmount: Number(estimateToAmountDecimal || 0),
    });
    setErrorMessage(() => undefined);
    setHealthFactor(() => newHealthFactor.toNumber());
    setInputFromAmount(() => value);
    setQuote(() => quote);
    setNewCollateralAmount(() => Number(estimateToAmountDecimal || 0));
    setBorrowAmount(() => borrowAvailableAmountOfReserve);
    // UI loader control
    setIsLoading(() => false);
  };

  const handleNewCollateralChange = async (r: IReserve) => {
    setNewCollateral(() => r);
    setNewCollateralAmount(() => 0);
    setBorrowAmount(() => 0);
    setErrorMessage(() => undefined);
    setHealthFactor(() => undefined);
    setInputFromAmount(() => 0);
    setQuote(() => undefined);
  };

  return (
    <>
      <IonRow>
        <IonCol size="12" className="ion-padding-horizontal">
          <div>
            <small className="ion-no-margin ion-margin-bottom" style={{display: "block"}}>
            Select collaterals and amount that you want transfer to calculate
            your available {reserve.symbol} borrow amount.
            </small>

            <IonText
              color="medium"
              style={{
                display: "block",
                padding: "0rem 0rem 0.25rem",
              }}
            >
              <small>From collateral</small>
            </IonText>
            <IonItem
              lines="none"
              style={{
                "--background": "transparent!important",
                marginBottom: "0.5rem",
                "--padding-start": "0.25rem",
              }}
            >
              <div
                slot="start"
                style={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <div
                  id="select-collateral-from"
                  style={{
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "nowrap",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    alignContent: "flex-start",
                  }}
                >
                  <IonIcon
                    src={chevronDown}
                    style={{ marginRight: "0.25rem" }}
                  />
                  <SymbolIcon
                    symbol={selectedCollateral?.symbol || ""}
                    chainId={selectedCollateral?.chainId}
                    iconSize="34px"
                  />
                </div>
                <IonPopover
                  trigger="select-collateral-from"
                  triggerAction="click"
                >
                  <IonContent
                    className="ion-no-padding"
                    style={{ maxHeight: "300px" }}
                  >
                    <IonListHeader>
                      <IonText>
                        <p>Available collaterals</p>
                      </IonText>
                    </IonListHeader>
                    <IonList>
                      {collateralPoolsGroup?.map((r, index) => (
                        <IonItem
                          button
                          detail={false}
                          key={"cross-collateral-item-" + index}
                          style={{ height: "3rem" }}
                          onClick={() => {
                            setSelectedCollateral(r);
                            setInputFromAmount(() => 0);
                            setErrorMessage(() => undefined);
                            setQuote(() => undefined);
                            setNewCollateralAmount(() => 0);
                            setBorrowAmount(() => 0);
                            console.log({ selectedCollateral });
                          }}
                        >
                          <div slot="start" style={{ margin: "0 0.25rem 0 0" }}>
                            <SymbolIcon
                              symbol={r.symbol}
                              chainId={r.chainId}
                              iconSize="28px"
                            />
                          </div>
                          <IonLabel
                            style={{
                              marginLeft: "0.25rem",
                              lineHeight: "0.8rem",
                            }}
                          >
                            <IonText>{r.symbol}</IonText>
                            <br />
                            <IonText color="medium">
                              <small>
                                {
                                  CHAIN_AVAILABLES.find(
                                    (c) => c.id === r.chainId
                                  )?.name
                                }
                              </small>
                            </IonText>
                          </IonLabel>
                          <div slot="end" className="ion-text-end">
                            <IonText>{Number(r?.balance).toFixed(6)}</IonText>
                            <br />
                            <IonText color="medium">
                              <small>
                                {getReadableAmount(
                                  +r?.balance,
                                  Number(r?.priceInUSD),
                                  "No deposit"
                                )}
                              </small>
                            </IonText>
                          </div>
                        </IonItem>
                      ))}
                    </IonList>
                  </IonContent>
                </IonPopover>
                <div className="ion-padding" style={{ cursor: "pointer" }}>
                  <IonText>
                    <h3 style={{ margin: " 0" }}>
                      {selectedCollateral?.symbol}
                    </h3>
                  </IonText>
                  <IonText color="medium">
                    <small style={{ margin: "0" }}>
                      Max :{maxAmount.toFixed(6)}
                    </small>
                  </IonText>
                </div>
              </div>
              <div slot="end" className="ion-text-end">
                <IonInput
                  style={{ fontSize: "1.5rem", minWidth: "100px" }}
                  placeholder="0"
                  type="number"
                  max={maxAmount}
                  min={0}
                  debounce={1500}
                  value={inputFromAmount}
                  onKeyUp={(e) => {
                    if (isNumberKey(e)) {
                      setIsLoading(() => true)
                    }
                  }}
                  onIonInput={(e) => handleInputChange(e)}
                />
              </div>
            </IonItem>

            <IonText
              color="medium"
              style={{
                display: "block",
                padding: "0rem 0rem 0.25rem",
              }}
            >
              <small>To collateral</small>
            </IonText>
            <IonItem
              lines="none"
              style={{
                "--background": "transparent!important",
                marginBottom: "2rem",
                "--padding-start": "0.25rem",
              }}
            >
              <div
                slot="start"
                style={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <div
                  id="select-collateral-to"
                  style={{
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "nowrap",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    alignContent: "flex-start",
                  }}
                >
                  <IonIcon
                    src={chevronDown}
                    style={{ marginRight: "0.25rem" }}
                  />
                  <SymbolIcon
                    symbol={newCollateral?.symbol}
                    chainId={newCollateral?.chainId}
                    iconSize="34px"
                  />
                </div>
                <IonPopover
                  trigger="select-collateral-to"
                  triggerAction="click"
                >
                  <IonContent
                    className="ion-no-padding"
                    style={{ maxHeight: "300px" }}
                  >
                    <IonListHeader>
                      <IonText>
                        <p>Deposit to</p>
                      </IonText>
                    </IonListHeader>
                    <IonList>
                      {depositPoolsGroup.map((r, index) => (
                        <IonItem
                          button
                          detail={false}
                          key={"cross-collateral-item-" + index}
                          style={{ height: "3rem" }}
                          onClick={() => handleNewCollateralChange(r)}
                        >
                          <div slot="start" style={{ margin: "0 0.25rem 0 0" }}>
                            <SymbolIcon
                              symbol={r.symbol}
                              chainId={r.chainId}
                              iconSize="28px"
                            />
                          </div>
                          <IonLabel
                            style={{
                              marginLeft: "0.25rem",
                              lineHeight: "0.8rem",
                            }}
                          >
                            <IonText>{r.symbol}</IonText>
                            <br />
                            <IonText color="medium">
                              <small>
                                {
                                  CHAIN_AVAILABLES.find(
                                    (c) => c.id === r.chainId
                                  )?.name
                                }
                              </small>
                            </IonText>
                          </IonLabel>
                          <div slot="end" className="ion-text-end">
                            <IonText>
                              {(Number(r?.supplyAPY || 0) * 100).toFixed(2)}%{" "}
                              <small>APY</small>
                            </IonText>
                            {/* <br />
                            <IonText color="medium">
                              <small>{}</small>
                            </IonText> */}
                          </div>
                        </IonItem>
                      ))}
                    </IonList>
                  </IonContent>
                </IonPopover>
                <div className="ion-padding" style={{ cursor: "pointer" }}>
                  <IonText>
                    <h3 style={{ margin: " 0" }}>{newCollateral.symbol}</h3>
                  </IonText>
                  <IonText color="medium">
                    <small style={{ margin: "0" }}>
                      APY :{" "}
                      {(Number(newCollateral?.supplyAPY || 0) * 100).toFixed(2)}
                      %
                    </small>
                  </IonText>
                </div>
              </div>
              <div slot="end" className="ion-text-end ion-padding-end">
                {isLoading ? (
                  <IonSkeletonText
                    animated
                    style={{ width: "6rem" }}
                    slot="end"
                  ></IonSkeletonText>
                ) : (
                  <>
                    <IonText>
                      <h3
                        style={{
                          margin: " 0",
                          fontSize: "1.5rem",
                        }}
                      >
                        {Number(newCollateralAmount) > 0
                          ? Number(newCollateralAmount || 0).toFixed(6)
                          : 0}
                      </h3>
                    </IonText>
                    <IonText color="medium">
                      <small>
                        ${" "}
                        {(
                          Number(newCollateral.priceInUSD) * newCollateralAmount
                        ).toFixed(2)}
                      </small>
                    </IonText>
                  </>
                )}
              </div>
            </IonItem>

            <IonText
              color="medium"
              style={{
                display: "block",
                padding: "0rem 0rem 0.25rem",
              }}
            >
              <small>Available to borrow</small>
            </IonText>
            <IonItem
              lines="none"
              style={{
                "--background": "transparent!important",
              }}
            >
              <div
                slot="start"
                style={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <SymbolIcon
                  symbol={reserve?.symbol}
                  chainId={reserve?.chainId}
                  iconSize="58px"
                />
                <div className="ion-padding" style={{ cursor: "pointer" }}>
                  <IonText>
                    <h3 style={{ margin: " 0" }}>{reserve.symbol}</h3>
                  </IonText>
                  <IonText color="medium">
                    <small style={{ margin: "0" }}>
                      APY :{" "}
                      {(Number(reserve?.variableBorrowAPY || 0) * 100).toFixed(
                        2
                      )}
                      %
                    </small>
                  </IonText>
                </div>
              </div>
              <div slot="end" className="ion-text-end ion-padding-end">
                {isLoading ? (
                  <IonSkeletonText
                    animated
                    style={{ width: "6rem" }}
                    slot="end"
                  ></IonSkeletonText>
                ) : (
                  <>
                    <IonText>
                      <h3
                        style={{
                          margin: " 0",
                          fontSize: "1.5rem",
                        }}
                      >
                        {Number(borrowAmount) > 0
                          ? Number(borrowAmount || 0).toFixed(6)
                          : 0}
                      </h3>
                    </IonText>
                    <IonText color="medium">
                      <small>
                        ${" "}
                        {(Number(reserve.priceInUSD) * borrowAmount).toFixed(2)}
                      </small>
                    </IonText>
                  </>
                )}
              </div>
            </IonItem>
          </div>
        </IonCol>
      </IonRow>

      {displayRiskCheckbox && !errorMessage && (
        <IonRow class="ion-justify-content-center">
          <IonCol
            size="auto"
            className="ion-padding-horizontal ion-padding-top"
          >
            <WarningBox>
              <p className="ion-n-padding ion-no-margin">
                <small>
                  Switch this amount of {selectedCollateral?.symbol} to
                  different pool will reduce your health factor and increase
                  risk of liquidation. Reduce amount or use a different
                  collateral to prevent liquidation.
                </small>
              </p>
            </WarningBox>
          </IonCol>
        </IonRow>
      )}

      {errorMessage && (
        <IonRow class="ion-justify-content-center">
          <IonCol size="12" className="ion-padding-horizontal ion-padding-top">
            <DangerBox>
              <p className="ion-no-padding ion-no-margin">
                <small>
                  {errorMessage}. <br />
                  Try again with other collaterals or amount.
                </small>
              </p>
            </DangerBox>
          </IonCol>
        </IonRow>
      )}

      <IonRow class="ion-justify-content-between ion-padding">
        <IonCol size="12">
          {collateralPoolsGroup.find((p) => p.chainId === reserve.chainId) && (
            <IonButton
              expand="block"
              fill="clear"
              color="primary"
              className="ion-no-margin"
              onClick={() => {
                toggleCrosschainForm();
              }}
            >
              <small>or use simple Borrow</small>
            </IonButton>
          )}
          <IonButton
            expand="block"
            onClick={async () => {
              // exclud all action if no quote available
              if (!quote?.id || !web3Provider) {
                return;
              }
              await displayLoader();
              try {
                // perform swap collaterals
                await checkAndSetAllowance(
                  web3Provider as ethers.providers.Web3Provider, 
                  quote.action.fromToken.address, 
                  quote.estimate.approvalAddress, 
                  quote.action.fromAmount,
                );
                await sendTransaction(quote, web3Provider as ethers.providers.Web3Provider);
                await presentToast({
                  message: `Swap callaterals successfully. Waiting form Borrow transaction...`,
                  duration: 5000,
                  color: "primary",
                  buttons: ['x']
                  
                });
                await hideLoader();
                // perform borrow by closing modal with params as `data`
                onSubmit(borrowAmount, "confirm");
              } catch (error: any) {
                await presentToast({
                  message: `Error while swap callaterals: ${error?.message||'Transaction failed'}. Please try again.`,
                  duration: 5000,
                  color: "danger",
                });
                await hideLoader();
              }
            }}
            strong={true}
            color="gradient"
            disabled={quote?.id ? false : true}
          >
            Confirm
          </IonButton>
        </IonCol>
      </IonRow>
    </>
  );
}
