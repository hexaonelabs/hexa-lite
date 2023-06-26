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
import { ComputedUserReserve, FormatReserveUSDResponse } from "@aave/math-utils";
import { useEffect, useRef, useState } from "react";
import { OverlayEventDetail } from "@ionic/react/dist/types/components/react-component-lib/interfaces";
import { useUser } from "../context/UserContext";
import ConnectButton from "./ConnectButton";
import { ethers } from "ethers";
import { borrow, submitTransaction, supplyWithPermit } from "../servcies/aave.service";
import { useEthersProvider } from "../context/Web3Context";

const formatCurrencyValue = (
  balance: number,
  priceInUSD?: number,
  msg?: string
) => {
  const result = Number(balance) * Number(priceInUSD || 1);
  if (result > 1000000) {
    return (result / 1000000).toFixed(2) + "M";
  }
  if (result > 1000) {
    return (result / 1000).toFixed(2) + "K";
  }
  if (result <= 0) {
    return msg || "0";
  }
  return result.toFixed(2);
};

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

const handleSupplyAsset = async (
  amountValue: string|number,
  reserve: ReserveDataHumanized,
  poolAddress: string,
  gatewayAddress: string,
  provider: ethers.providers.Web3Provider
) => {
  const amount = Number(amountValue);
  console.log('amount: ', amount);
  
  // handle invalid amount
  if (isNaN(amount) || amount <= 0) {
    throw new Error('Invalid amount. Value must be greater than 0.');
  }
  // call method
  const txs = await supplyWithPermit(
    {
      provider,
      reserve,
      amount: amount.toString(),
      onBehalfOf: undefined,
      poolAddress,
      gatewayAddress
    }
  );
  console.log('txs: ', txs); 
}

const handleBorrowAsset = async (
  amountValue: string|number,
  reserve: ReserveDataHumanized,
  poolAddress: string,
  gatewayAddress: string,
  provider: ethers.providers.Web3Provider
) => {
  const amount = Number(amountValue);
  console.log('amount: ', amount);
  
  // handle invalid amount
  if (isNaN(amount) || amount <= 0) {
    throw new Error('Invalid amount. Value must be greater than 0.');
  }
  // call method
  const txs = await borrow(
    {
      provider,
      reserve,
      amount: amount.toString(),
      onBehalfOf: undefined,
      poolAddress,
      gatewayAddress,
    }
  );
  return Promise.all([
    ...txs.map(tx => submitTransaction({tx, provider}))
  ]); 
}

export const DefiContainer = () => {
  const { user } = useUser();
  const { ethereum } = useEthersProvider();
  const { walletBallance, markets } = useAave();
  const [present, dismiss] = useIonModal(FormModal, {
    onDismiss: (data: string, role: string) => dismiss(data, role),
  });
  const [message, setMessage] = useState(
    "This modal example uses the modalController to present and dismiss modals."
  );

  function openModal(type: string, reserve: ReserveDataHumanized ) {
    present({
      onWillDismiss: async (ev: CustomEvent<OverlayEventDetail>) => {
        if (ev.detail.role === "confirm") {
          console.log(`${ev.detail.data}!`);
          if (!ethereum) {
            throw new Error('No ethereum provider found');
          }
          switch (true) {
            case type === 'deposit':
              const amount = ev.detail.data;
              const result = await handleSupplyAsset(
                Number(amount),
                reserve,
                `${markets?.POOL}`,
                `${markets?.WETH_GATEWAY}`,
                ethereum
              );
              console.log('TX result: ', result);
              break;
            case type === 'borrow': {
              // get amount
              const amount = ev.detail.data;
              // call method
              const result = await handleBorrowAsset(
                Number(amount),
                reserve,
                `${markets?.POOL}`,
                `${markets?.WETH_GATEWAY}`,
                ethereum
              );
              console.log('TX result: ', result);
              break;
            }
            default:
              break;
          }
        }
      },
    });
  }

  console.log('xxx walletBallance: ', walletBallance);
  
  const reserves = walletBallance?.map((reserve) => {
    const { aTokenAddress } = reserve;
    const supplyBalance = 0;
    // walletBalance.find(
    //   token => token.address?.toLocaleLowerCase() === aTokenAddress?.toLocaleLowerCase()
    // )?.balance||0;
    const borrowBalance = 0;
    // walletBalance.find(
    //   token => token.address?.toLocaleLowerCase() === reserve.variableDebtTokenAddress?.toLocaleLowerCase()
    // )?.balance||0;
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
    return {
      ...reserve,
      borrowBalance,
      supplyBalance,
      logo,
    };
  });

  return reserves?.length === 0 ? (
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

        <IonCol class="ion-padding" size-xs="12" size-sm="12" size-md="6" size-lg="5" size-xl="5">
          <div className="widgetWrapper">
            <h3
              style={{
                textAlign: "center",
                margin: "1rem auto 2rem",
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
                    <h3>Wallet balance</h3>
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
              {reserves.map((reserve, index) => (
                <IonAccordion key={index}>
                  <IonItem slot="header">
                    <IonGrid>
                      <IonRow class="ion-align-items-center ion-justify-content-between ion-padding-vertical">
                        <IonCol size="auto">
                          <IonAvatar style={{height: '32px', width: '32px'}}>
                            <IonImg src={reserve?.logo}></IonImg>
                          </IonAvatar>
                        </IonCol>
                        <IonCol size="3" class="ion-text-start">
                          <IonLabel class="ion-padding-start">
                            {reserve?.symbol}
                            <p>
                              <small>
                                {reserve?.name}
                              </small>
                            </p>
                          </IonLabel>
                        </IonCol>
                        <IonCol size="4" class="ion-text-end">
                          <IonLabel>
                            {reserve?.supplyBalance || "0.00"}
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
                            {(Number(reserve?.supplyAPY || 0) * 100).toFixed(2)}%
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
                            disabled={reserve?.supplyBalance <= 0}
                            onClick={(e) => {
                              console.log("withdraw");
                            }}
                          >
                            Withdraw
                          </IonButton>
                        </IonCol>
                        <IonCol size="auto">
                          <IonButton
                            fill="solid"
                            color="primary"
                            onClick={() => openModal('deposit', reserve)}
                          >
                            Deposit
                          </IonButton>
                        </IonCol>
                      </IonRow>
                    )}
                    <IonRow>
                      <IonCol size="12">
                        <IonItem style={{ "--background": "transparent" }}>
                          <IonLabel color="medium">Liquidity protocol</IonLabel>
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
                            {formatCurrencyValue(Number(reserve.supplyCapUSD))}
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

        <IonCol class="ion-padding" size-xs="12" size-sm="12" size-md="6" size-lg="5" size-xl="5">
          <div className="widgetWrapper">
            <h3
              style={{
                textAlign: "center",
                margin: "1rem auto 2rem",
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
                    <h3>Wallet balance</h3>
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
                            <IonAvatar style={{width: '32px', height: '32px'}}>
                              <IonImg src={reserve?.logo}></IonImg>
                            </IonAvatar>
                          </IonCol>
                          <IonCol size="3" class="ion-text-start">
                            <IonLabel class="ion-padding-start">
                              {reserve?.symbol}
                              <p>
                                <small>
                                  {reserve?.name}
                                </small>
                              </p>
                            </IonLabel>
                          </IonCol>
                          <IonCol size="4" class="ion-text-end">
                            <IonLabel>
                              {reserve?.borrowBalance || "0.00"}
                              <br />
                              <IonText color="medium">
                                <small>
                                  {formatCurrencyValue(
                                    reserve?.borrowBalance,
                                    Number(reserve?.priceInUSD),
                                    "No deposit"
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
                              disabled={reserve?.borrowBalance <= 0}
                              onClick={(e) => {
                                console.log("repay");
                              }}
                            >
                              Repay
                            </IonButton>
                          </IonCol>
                          <IonCol size="auto">
                            <IonButton
                              fill="solid"
                              color="primary"
                              onClick={() => openModal('borrow', reserve)}
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
