import {
  IonAccordion,
  IonAccordionGroup,
  IonAvatar,
  IonButton,
  IonButtons,
  IonCol,
  IonGrid,
  IonHeader,
  IonImg,
  IonInput,
  IonItem,
  IonLabel,
  IonListHeader,
  IonPage,
  IonRow,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
  useIonModal,
} from "@ionic/react";
import { useAave } from "../context/AaveContext";
import { Pool, ReserveDataHumanized } from "@aave/contract-helpers";
import {
  ComputedUserReserve,
  FormatReserveUSDResponse,
} from "@aave/math-utils";
import { useEffect, useRef, useState } from "react";
import { OverlayEventDetail } from "@ionic/react/dist/types/components/react-component-lib/interfaces";
import { useUser, IAsset } from "../context/UserContext";
import ConnectButton from "./ConnectButton";
import { ethers } from "ethers";
import {
  borrow,
  repay,
  submitTransaction,
  supplyWithPermit,
  withdraw,
} from "../servcies/aave.service";
import { useEthersProvider } from "../context/Web3Context";

const formatCurrencyValue = (
  balance: number,
  priceInUSD?: number,
  msg?: string
) => {
  const result = Number(balance) * Number(priceInUSD || 1);
  if (result > 1000000000000) {
    return "$" + (result / 1000000000000).toFixed(2) + "T";
  }
  if (result > 1000000000) {
    return "$" + (result / 1000000000).toFixed(2) + "B";
  }
  if (result > 1000000) {
    return "$" + (result / 1000000).toFixed(2) + "M";
  }
  if (result > 1000) {
    return "$" + (result / 1000).toFixed(2) + "K";
  }
  if (result <= 0) {
    return msg || "0";
  }
  return "$" + result.toFixed(2);
};

// const getWalletBalanceAndPriceUsd = (reserve: ReserveDataHumanized & FormatReserveUSDResponse, asset: IAsset[]): {
//   balance: number;
//   priceInUSD: number;
// } => {
//   const { symbol, aTokenAddress, underlyingAsset } = reserve;
//   const assetBalance = asset.find((token) => token.symbol === symbol || token.contractAddress?.toLocaleLowerCase() === aTokenAddress?.toLocaleLowerCase());
//   const balance = assetBalance?.balance || 0;
//   const priceInUSD = assetBalance?.priceUsd || 0;
//   return {
//     balance,
//     priceInUSD,
//   }
// };

const FormModal = ({
  onDismiss,
}: {
  onDismiss: (data?: string | null | undefined | number, role?: string) => void;
}) => {
  const inputRef = useRef<HTMLIonInputElement>(null);
  return (
    <IonPage>
      <IonGrid className="ion-padding" style={{ width: "100%" }}>
        <IonRow class="ion-justify-content-between">
          <IonCol size="6">
            <IonButton color="medium" onClick={() => onDismiss(null, "cancel")}>
              Cancel
            </IonButton>
          </IonCol>
          <IonCol size="6">
            <IonButton
              onClick={() => onDismiss(inputRef.current?.value, "confirm")}
              strong={true}
            >
              Confirm
            </IonButton>
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol size="12">
            <IonItem>
              <IonInput
                ref={inputRef}
                labelPlacement="stacked"
                label="enter a amount"
                placeholder="amount"
              />
            </IonItem>
          </IonCol>
        </IonRow>
      </IonGrid>
    </IonPage>
  );
};

export const DefiContainer = () => {
  const { user, assets } = useUser();
  const { ethereumProvider } = useEthersProvider();
  const { poolReserves, markets, totalTVL } = useAave();
  const [present, dismiss] = useIonModal(FormModal, {
    onDismiss: (data: string, role: string) => dismiss(data, role),
  });

  function handleOpenModal(type: string, reserve: ReserveDataHumanized) {
    present({
      onWillDismiss: async (ev: CustomEvent<OverlayEventDetail>) => {
        if (ev.detail.role === "confirm") {
          console.log(`${ev.detail.data}!`);
          if (!ethereumProvider) {
            throw new Error("No ethereumProvider provider found");
          }
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
                provider: ethereumProvider,
                reserve,
                amount: amount.toString(),
                onBehalfOf: undefined,
                poolAddress: `${markets?.POOL}`,
                gatewayAddress: `${markets?.WETH_GATEWAY}`,
              };
              console.log("params: ", params);
              const txReceipts = await supplyWithPermit(params);
              console.log("TX result: ", txReceipts);
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
                provider: ethereumProvider,
                reserve,
                amount: amount.toString(),
                onBehalfOf: undefined,
                poolAddress: `${markets?.POOL}`,
                gatewayAddress: `${markets?.WETH_GATEWAY}`,
              };
              console.log("params: ", params);
              const txReceipts = await withdraw(params);
              console.log("TX result: ", txReceipts);
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
                provider: ethereumProvider,
                reserve,
                amount: amount.toString(),
                onBehalfOf: undefined,
                poolAddress: `${markets?.POOL}`,
                gatewayAddress: `${markets?.WETH_GATEWAY}`,
              };
              console.log("params: ", params);
              const txReceipts = await borrow(params);
              console.log("TX result: ", txReceipts);
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
                provider: ethereumProvider,
                reserve,
                amount: amount.toString(),
                onBehalfOf: undefined,
                poolAddress: `${markets?.POOL}`,
                gatewayAddress: `${markets?.WETH_GATEWAY}`,
              };
              console.log("params: ", params);
              const txReceipts = await repay(params);
              console.log("TX result: ", txReceipts);
              break;
            }
            default:
              break;
          }
        }
      },
    });
  }

  function currencyFormat(
    num: number,
    ops?: { currency?: string; language?: string }
  ) {
    const currency = ops?.currency || "USD";
    const language = ops?.language || "en-US";
    return num.toLocaleString(language, {
      style: "currency",
      currency,
    });
  }

  console.log("[INFO] {{DefiContainer}} poolReserves: ", poolReserves);
  const poolFormated = poolReserves?.map((reserve) => {
    return {
      reserve,
      underlyingBalance: null,
      scaledATokenBalance: null,
    };
  });

  const reserves = (poolFormated)
  ?.filter(({ reserve: { usageAsCollateralEnabled, isIsolated }  }) => usageAsCollateralEnabled === true && isIsolated === false)
  ?.map(
    ({ reserve }) => {
      const { aTokenAddress, decimals, variableDebtTokenAddress } = reserve;
      const { balance: borrowBalance = 0, priceUsd: borrowPriceUsd } =
        assets?.find(
          ({contractAddress}) =>
            contractAddress?.toLocaleLowerCase() ===
            variableDebtTokenAddress?.toLocaleLowerCase()
        ) || {};
      const { balance: supplyBalance = 0, priceUsd: supplyPriceUsd} =
        assets?.find(
          ({contractAddress}) =>
            contractAddress?.toLocaleLowerCase() ===
            aTokenAddress?.toLocaleLowerCase()
        ) || {};

      let logo =
        "./assets/cryptocurrency-icons/" +
        reserve?.symbol?.toLowerCase() +
        ".svg";
      if (reserve.symbol === "WMATIC") {
        logo = `./assets/icons/wmatic.svg`;
      }
      if (reserve.symbol === "aPolWMATIC") {
        logo = `./assets/icons/awmatic.svg`;
      }
      if (reserve.symbol === "stMATIC") {
        logo = `./assets/icons/stmatic.svg`;
      }
      if (reserve.symbol === "wstETH") {
        logo = `./assets/icons/wsteth.svg`;
      }
      if (reserve.symbol === "stETH") {
        logo = `./assets/icons/steth.svg`;
      }
      if (reserve.symbol === "cbETH") {
        logo = `./assets/icons/cbeth.svg`;
      }
      if (reserve.symbol === "ENS") {
        logo = `./assets/icons/ens.svg`;
      }
      if (reserve.symbol === "LDO") {
        logo = `./assets/icons/ldo.svg`;
      }
      if (reserve.symbol === "LUSD") {
        logo = `./assets/icons/lusd.svg`;
      }
      if (reserve.symbol === "rETH") {
        logo = `./assets/icons/reth.svg`;
      }
      if (reserve.symbol === "WETH") {
        logo = `./assets/icons/weth.svg`;
      }
      console.log("[INFO] {{DefiContainer}} : ", {
        symbol: reserve.symbol,
        borrowBalance,
        borrowBalanceUsd: borrowBalance * (borrowPriceUsd||0),
        supplyBalance,
        supplyBalanceUsd: supplyBalance * (supplyPriceUsd||0),
        logo,
      });
      
      return {
        ...reserve,
        borrowBalance,
        borrowBalanceUsd: borrowBalance * (supplyPriceUsd||0),
        supplyBalance,
        supplyBalanceUsd: supplyBalance * (supplyPriceUsd||0),
        logo,
      };
    }
  );

  const totalBorrowsUsd = (reserves||[])?.reduce(
    (acc, reserve) => acc + reserve.borrowBalance * (Number(reserve?.priceInUSD)||0),
    0
  )
  const totalCollateralUsd = (reserves||[])?.reduce(
    (acc, reserve) => acc + reserve.supplyBalance * (Number(reserve?.priceInUSD)||0),
    0
  )

  // calcule 75% of totalCollateralUsd
  const borrowingCapacity = totalCollateralUsd * 0.75;

  console.log("[INFO] totalCollateralUsd : ", totalCollateralUsd);


  return !reserves || reserves.length === 0 ? (
    <IonGrid class="ion-padding">
      <IonRow class="ion-padding">
        <IonCol size="12" class="ion-text-center ion-padding">
          <IonSpinner color="primary"></IonSpinner>
        </IonCol>
      </IonRow>
    </IonGrid>
  ) : (
    <IonGrid class="ion-no-padding" style={{ marginBottom: "5rem" }}>
      <IonRow class="ion-justify-content-center">
        <IonCol size="12" class="ion-text-center">
          <IonText>
            <h1>DeFi liquidity protocol</h1>
          </IonText>
          <IonText color="medium">
            <p
              style={{
                lineHeight: "1.3rem",
              }}
            >
              Borrow assets using your crypto as collateral <br />
              and earn interest by providing liquidity
              <span
                style={{
                  fontSize: "2rem",
                  display: "block",
                  color: "var(--ion-color-primary)",
                  margin: "1rem 1rem 3rem",
                  fontFamily: "monospace",
                  fontWeight: 600,
                }}
              >
                {currencyFormat(totalTVL || 0)} TVL
              </span>
            </p>
          </IonText>
        </IonCol>
      </IonRow>

      <IonRow class="ion-justify-content-center">
        <IonCol class="ion-padding" size-md="12" size-lg="10" size-xl="10">
          <IonGrid class="ion-no-padding">
            <IonRow class="ion-text-center widgetWrapper">
              <IonCol
                size="12"
                size-md="4"
                class=" ion-padding-vertical ion-margin-vertical"
              >
                <h3>
                  {currencyFormat(
                    totalCollateralUsd
                  )}
                </h3>
                <IonText color="medium">
                  <p>
                    MY DEPOSIT BALANCE
                    <br />
                    <small>Used as collateral to borrow assets</small>
                  </p>
                </IonText>
              </IonCol>
              <IonCol
                size="12"
                size-md="4"
                class=" ion-padding-vertical ion-margin-vertical"
              >
                <h3>
                  {currencyFormat(
                    borrowingCapacity
                  )}
                </h3>
                <IonText color="medium">
                  <p>
                    BORROWING CAPACITY
                    <br />
                    <small>
                      Maximum amount you can borrow
                    </small>
                  </p>
                </IonText>
              </IonCol>
              <IonCol
                size="12"
                size-md="4"
                class=" ion-padding-vertical ion-margin-vertical"
              >
                <h3>
                {currencyFormat(
                    totalBorrowsUsd
                  )}
                </h3>
                <IonText color="medium">
                  <p>
                    MY BORROW BALANCE
                    <br />
                    <small>Total amount borrowed</small>
                  </p>
                </IonText>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonCol>
      </IonRow>

      <IonRow class="ion-justify-content-center">
        <IonCol class="ion-padding ion-text-center" size="12">
          <h1>Available Markets</h1>
        </IonCol>
      </IonRow>

      <IonRow class="ion-justify-content-center">
        <IonCol
          class="ion-padding"
          size-xs="12"
          size-sm="12"
          size-md="6"
          size-lg="5"
          size-xl="5"
        >
          <div className="widgetWrapper">
            <h3
              style={{
                textAlign: "center",
                margin: "2rem auto 2rem",
              }}
            >
              Deposits
            </h3>
            <IonGrid>
              <IonRow class="ion-align-items-center ion-justify-content-between">
                <IonCol size="4" class="ion-padding-start">
                  <IonLabel color="medium">
                    <h3>Asset</h3>
                  </IonLabel>
                </IonCol>
                <IonCol size="4" class="ion-text-end ion-padding-end">
                  <IonLabel color="medium">
                    <h3>Deposited</h3>
                  </IonLabel>
                </IonCol>
                <IonCol size="3" class="ion-text-end">
                  <IonLabel color="medium">
                    <h3 style={{ paddingRight: "2rem" }}>APY</h3>
                  </IonLabel>
                </IonCol>
              </IonRow>
            </IonGrid>
            <IonAccordionGroup>
              {reserves
                .sort((a, b) => b.supplyBalance - a.supplyBalance)
                .map((reserve, index) => (
                  <IonAccordion key={index}>
                    <IonItem slot="header">
                      <IonGrid onClick={() => console.log(reserve)}>
                        <IonRow class="ion-align-items-center ion-justify-content-between ion-padding-vertical">
                          <IonCol size="auto">
                            <IonAvatar
                              style={{ height: "32px", width: "32px" }}
                            >
                              <IonImg src={reserve?.logo}></IonImg>
                            </IonAvatar>
                          </IonCol>
                          <IonCol size="3" class="ion-text-start">
                            <IonLabel class="ion-padding-start">
                              {reserve?.symbol}
                              <p>
                                <small>{reserve?.name}</small>
                              </p>
                            </IonLabel>
                          </IonCol>
                          <IonCol size="4" class="ion-text-end">
                            <IonLabel>
                              {reserve?.supplyBalance.toFixed(4) || "0.00"}
                              <br />
                              <IonText color="medium">
                                <small>
                                  {formatCurrencyValue(
                                    reserve?.supplyBalance,
                                    Number(reserve?.priceInUSD),
                                    "No deposit"
                                  )}
                                </small>
                              </IonText>
                            </IonLabel>
                          </IonCol>
                          <IonCol size="3" class="ion-text-end">
                            <IonLabel>
                              {(Number(reserve?.supplyAPY || 0) * 100).toFixed(
                                2
                              )}
                              %
                            </IonLabel>
                          </IonCol>
                        </IonRow>
                      </IonGrid>
                    </IonItem>
                    <IonGrid className="ion-padding" slot="content">
                      {!user ? (
                        <IonRow class="ion-justify-content-center ion-align-item-center ion-padding-vertical">
                          <IonCol size="auto" class="ion-margin-bottom">
                            <ConnectButton></ConnectButton>
                          </IonCol>
                        </IonRow>
                      ) : (
                        <IonRow class="ion-justify-content-center ion-align-item-center ion-padding-vertical">
                          <IonCol size="auto">
                            <IonButton
                              fill="solid"
                              color="primary"
                              onClick={() =>
                                handleOpenModal("withdraw", reserve)
                              }
                            >
                              Withdraw
                            </IonButton>
                          </IonCol>
                          <IonCol size="auto">
                            <IonButton
                              fill="solid"
                              color="primary"
                              onClick={() =>
                                handleOpenModal("deposit", reserve)
                              }
                            >
                              Deposit
                            </IonButton>
                          </IonCol>
                        </IonRow>
                      )}
                      <IonRow>
                        <IonCol size="12">
                          <IonItem style={{ "--background": "transparent" }}>
                            <IonLabel color="medium">
                              Liquidity protocol
                            </IonLabel>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                alignContent: "center",
                              }}
                            >
                              <IonImg
                                style={{ width: "18px", heigth: "18px" }}
                                src="./assets/cryptocurrency-icons/aave.svg"
                              ></IonImg>
                              <IonText class="ion-margin-start" color="medium">
                                <small>Aave</small>
                              </IonText>
                            </div>
                          </IonItem>
                          <IonItem style={{ "--background": "transparent" }}>
                            <IonLabel color="medium">
                              Available liquidity
                            </IonLabel>
                            <IonText color="medium">
                              {formatCurrencyValue(
                                Number(reserve.formattedAvailableLiquidity)
                              )}
                            </IonText>
                          </IonItem>
                          <IonItem
                            lines="none"
                            style={{ "--background": "transparent" }}
                          >
                            <IonLabel color="medium">
                              Deposit capitalisation
                            </IonLabel>
                            <IonText color="medium">
                              {formatCurrencyValue(
                                Number(reserve.supplyCapUSD)
                              )}
                            </IonText>
                          </IonItem>
                        </IonCol>
                      </IonRow>
                    </IonGrid>
                  </IonAccordion>
                ))}
            </IonAccordionGroup>
          </div>
        </IonCol>

        <IonCol
          class="ion-padding"
          size-xs="12"
          size-sm="12"
          size-md="6"
          size-lg="5"
          size-xl="5"
        >
          <div className="widgetWrapper">
            <h3
              style={{
                textAlign: "center",
                margin: "2rem auto 2rem",
              }}
            >
              Borrowing
            </h3>
            <IonGrid>
              <IonRow class="ion-align-items-center ion-justify-content-between">
                <IonCol size="4" class="ion-padding-start">
                  <IonLabel color="medium">
                    <h3>Asset</h3>
                  </IonLabel>
                </IonCol>
                <IonCol size="4" class="ion-text-end ion-padding-end">
                  <IonLabel color="medium">
                    <h3>Borrowed</h3>
                  </IonLabel>
                </IonCol>
                <IonCol size="3" class="ion-text-end">
                  <IonLabel color="medium">
                    <h3 style={{ paddingRight: "2rem" }}>APY</h3>
                  </IonLabel>
                </IonCol>
              </IonRow>
            </IonGrid>
            <IonAccordionGroup>
              {reserves
                .filter((reserve) => reserve.borrowingEnabled)
                .sort((a, b) => b.borrowBalance - a.borrowBalance)
                .map((reserve, index) => (
                  <IonAccordion key={index}>
                    <IonItem slot="header">
                      <IonGrid>
                        <IonRow class="ion-align-items-center ion-justify-content-between ion-padding-vertical">
                          <IonCol size="auto">
                            <IonAvatar
                              style={{ width: "32px", height: "32px" }}
                            >
                              <IonImg src={reserve?.logo}></IonImg>
                            </IonAvatar>
                          </IonCol>
                          <IonCol size="3" class="ion-text-start">
                            <IonLabel class="ion-padding-start">
                              {reserve?.symbol}
                              <p>
                                <small>{reserve?.name}</small>
                              </p>
                            </IonLabel>
                          </IonCol>
                          <IonCol size="4" class="ion-text-end">
                            <IonLabel>
                              {reserve?.borrowBalance.toFixed(4) || "0.00"}
                              <br />
                              <IonText color="medium">
                                <small>
                                  {formatCurrencyValue(
                                    reserve?.borrowBalance,
                                    Number(reserve?.priceInUSD),
                                    "No debit"
                                  )}
                                </small>
                              </IonText>
                            </IonLabel>
                          </IonCol>
                          <IonCol size="3" class="ion-text-end">
                            <IonLabel>
                              {(
                                Number(reserve?.variableBorrowAPY || 0) * 100
                              ).toFixed(2)}
                              %
                            </IonLabel>
                          </IonCol>
                        </IonRow>
                      </IonGrid>
                    </IonItem>
                    <IonGrid className="ion-padding" slot="content">
                      {!user ? (
                        <IonRow class="ion-justify-content-center ion-align-item-center ion-padding-vertical">
                          <IonCol size="auto" class="ion-margin-bottom">
                            <ConnectButton></ConnectButton>
                          </IonCol>
                        </IonRow>
                      ) : (
                        <IonRow class="ion-justify-content-center ion-align-item-center ion-padding-vertical">
                          <IonCol size="auto">
                            <IonButton
                              fill="solid"
                              color="primary"
                              onClick={() => handleOpenModal("repay", reserve)}
                            >
                              Repay
                            </IonButton>
                          </IonCol>
                          <IonCol size="auto">
                            <IonButton
                              fill="solid"
                              color="primary"
                              onClick={() => handleOpenModal("borrow", reserve)}
                            >
                              Borrow
                            </IonButton>
                          </IonCol>
                        </IonRow>
                      )}
                      <IonRow>
                        <IonCol size="12">
                          <IonItem style={{ "--background": "transparent" }}>
                            <IonLabel color="medium">
                              Liquidity protocol
                            </IonLabel>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                alignContent: "center",
                              }}
                            >
                              <IonImg
                                style={{ width: "18px", heigth: "18px" }}
                                src="./assets/cryptocurrency-icons/aave.svg"
                              ></IonImg>
                              <IonText class="ion-margin-start" color="medium">
                                <small>Aave</small>
                              </IonText>
                            </div>
                          </IonItem>
                          <IonItem style={{ "--background": "transparent" }}>
                            <IonLabel color="medium">
                              Available liquidity
                            </IonLabel>
                            <IonText color="medium">
                              {formatCurrencyValue(
                                Number(reserve.formattedAvailableLiquidity)
                              )}
                            </IonText>
                          </IonItem>
                          <IonItem
                            lines="none"
                            style={{ "--background": "transparent" }}
                          >
                            <IonLabel color="medium">
                              Deposit capitalisation
                            </IonLabel>
                            <IonText color="medium">
                              {formatCurrencyValue(
                                Number(reserve.borrowCapUSD)
                              )}
                            </IonText>
                          </IonItem>
                        </IonCol>
                      </IonRow>
                    </IonGrid>
                  </IonAccordion>
                ))}
            </IonAccordionGroup>
          </div>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};
