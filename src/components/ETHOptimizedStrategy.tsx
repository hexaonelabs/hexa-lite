import {
  IonButton,
  IonCard,
  IonCol,
  IonGrid,
  IonImg,
  IonInput,
  IonItem,
  IonLabel,
  IonRow,
  IonText,
  IonThumbnail,
  IonSkeletonText,
  IonSpinner,
  IonIcon,
  IonModal,
  useIonToast,
  IonContent,
} from "@ionic/react";
import {
  informationCircleOutline,
  closeSharp,
  openOutline,
  warningOutline,
} from "ionicons/icons";
import { useEthersProvider } from "../context/Web3Context";
import { useLoader } from "../context/LoaderContext";
import { useEffect, useRef, useState } from "react";
import { getMaxAmountAvailableToBorrow } from "../utils/getMaxAmountAvailableToBorrow";
import { getMaxAmountAvailableToSupply } from "../utils/getMaxAmountAvailableToSupply";
import { ethers } from "ethers";
import {
  ChainId,
  InterestRate,
} from "@aave/contract-helpers";
import { useUser } from "../context/UserContext";
import { getAssetIconUrl } from "../utils/getAssetIconUrl";
import {
  EthOptimizedContextType,
  useEthOptimizedStrategy,
} from "../context/EthOptimizedContext";
import { OverlayEventDetail } from "@ionic/react/dist/types/components/react-component-lib/interfaces";
import ConnectButton from "./ConnectButton";
import { isAavePoolDisabled, roundToTokenDecimals } from "../utils/utils";
import { swapWithLiFi } from "../servcies/lifi.service";
import { borrow, supplyWithPermit } from "../servcies/aave.service";
import { CHAIN_AVAILABLES } from "../constants/chains";
import { getETHByWstETH } from "../servcies/lido.service";
import { BigNumberZeroDecimal } from "@aave/math-utils";
import { useAave } from "../context/AaveContext";
import { FormattedNumber } from "./FormattedNumber";
import { AssetInput } from "./AssetInput";

export const minBaseTokenRemainingByNetwork: Record<number, string> = {
  [ChainId.optimism]: "0.0001",
  [ChainId.arbitrum_one]: "0.0001",
};

export interface IStrategyModalProps {
  dismiss?: (data?: any, role?: string | undefined) => Promise<boolean> | undefined;
}

const ACTIONS = {
  handleSwap: async (
    strategy: EthOptimizedContextType,
    amount: number,
    balanceWETH: number,
    provider: ethers.providers.Web3Provider
  ): Promise<{
    txReceipts?: ethers.providers.TransactionReceipt[];
  }> => {
    if (!provider) {
      return {};
    }
    // verify max amount
    if (amount > balanceWETH) {
      console.error({
        message: `Invalid amount: ${amount}. Value must be less or equal than your balance.`,
      });
      return {};
    }
    const stepDeposit = strategy.step.find((s) => s.type === "deposit");
    const stepBorrow = strategy.step.find((s) => s.type === "borrow");
    if (!stepDeposit || !stepBorrow) {
      throw new Error("Invalid step");
    }
    // handle invalid amount
    if (isNaN(amount) || amount <= 0) {
      throw new Error("Invalid amount. Value must be greater than 0.");
    }
    // convert decimal amount to bigNumber string using token decimals
    const amountInWei = ethers.utils.parseUnits(
      amount.toString(),
      stepBorrow.reserve?.decimals || 18
    ).toString();

    // call method
    const fromAddress = await provider?.getSigner().getAddress();
    const params = {
      fromAddress,
      fromAmount: amountInWei, 
      fromChain: provider.network.chainId.toString(),
      fromToken: stepBorrow.reserve?.underlyingAsset as string, // WETH
      toChain: provider.network.chainId.toString(),
      toToken: stepDeposit.reserve?.underlyingAsset as string, // wstETH
    };
    console.log("params: ", {params});
    
    const receipt = await swapWithLiFi(
      params,
      provider
    );
    console.log("TX result: ", receipt);
    return { txReceipts: [receipt] };
  },

  handleDeposit: async (
    strategy: EthOptimizedContextType,
    amount: number,
    provider: ethers.providers.Web3Provider
  ): Promise<{
    txReceipts?: ethers.providers.TransactionReceipt[];
  }> => {
    if (!provider) {
      return {};
    }
    const reserve = strategy.step.find((s) => s.type === "deposit")?.reserve;
    if (!reserve) {
      throw new Error("Invalid reserve");
    }
    // handle invalid amount
    if (isNaN(amount) || amount <= 0) {
      throw new Error("Invalid amount. Value must be greater than 0.");
    }
    // call method
    const params = {
      provider,
      reserve,
      amount: amount.toString(),
      onBehalfOf: undefined,
      poolAddress: strategy.poolAddress,
      gatewayAddress: strategy.gateway,
    };
    console.log("params: ", params);
    try {
      const txReceipts = await supplyWithPermit(params);
      console.log("TX result: ", txReceipts);
      return { txReceipts };
    } catch (error) {
      throw error;
    }
  },

  handleBorrow: async (
    strategy: EthOptimizedContextType,
    amount: number,
    provider: ethers.providers.Web3Provider
  ): Promise<{
    txReceipts?: ethers.providers.TransactionReceipt[];
  }> => {
    if (!provider) {
      return {};
    }
    const reserve = strategy.step.find((s) => s.type === "borrow")?.reserve;
    if (!reserve) {
      throw new Error("Invalid reserve");
    }
    // handle invalid amount
    if (isNaN(amount) || amount <= 0) {
      throw new Error("Invalid amount. Value must be greater than 0.");
    }
    // call method
    const params = {
      provider,
      reserve,
      amount: amount.toString(),
      onBehalfOf: undefined,
      poolAddress: strategy.poolAddress,
      gatewayAddress: strategy.gateway,
    };
    console.log("params: ", params);
    try {
      const txReceipts = await borrow(params);
      console.log("TX result: ", txReceipts);
      return { txReceipts };
    } catch (error) {
      throw error;
    }
  },
};

export function EthOptimizedStrategyModal({dismiss}: IStrategyModalProps) {
  const strategy = useEthOptimizedStrategy();
  const { refresh: refreshAAVE } = useAave();
  const { ethereumProvider } = useEthersProvider();
  const { assets, refresh: refreshUser } = useUser();
  const { display: displayLoader, hide: hideLoader } = useLoader();

  console.log('strategy: ',{ strategy , dismiss, refreshAAVE, refreshUser});
  
  const [stepIndex, setStepIndex] = useState(0);
  const [wstToEthAmount, setWstToEthAmount] = useState(-1);
  const [inputDepositValue, setInputDepositValue] = useState(-1);
  const [inputBorrowtValue, setInputBorrowtValue] = useState(-1);
  const [inputSwapValue, setInputSwapValue] = useState(0);
  // create ref for input deposit, borrow, swap
  // const inputDepositRef = useRef<HTMLIonInputElement>(null);
  const inputBorrowRef = useRef<HTMLIonInputElement>(null);
  // const inputSwapRef = useRef<HTMLIonInputElement>(null);
  const toastContext = useIonToast();
  const presentToast = toastContext[0];
  const dismissToast = toastContext[1];

  const noticeMessage = (
    name: string
  ) => `Our strategies leverage and connect to ${name?.toUpperCase()} protocol smart contracts without any third-party involvement, providing a trustless and completely transparent experience.
  Rest assured, our solutions are non-custodial, allowing you to withdraw your assets at any time. Control remains in your hands!`;
  const { userLiquidationThreshold = 0 } = strategy || {};

  const minBaseTokenRemaining =
    minBaseTokenRemainingByNetwork[ethereumProvider?.network?.chainId || 137] ||
    "0.001";

  const { balance: walletBalanceWSTETH = 0 } =
    assets?.find(
      ({ contractAddress, chain = {} }) =>
        contractAddress?.toLocaleLowerCase() ===
          strategy?.step
            .find(
              (s) =>
                s.type === "deposit" && s.from.toLocaleLowerCase() === "wsteth"
            )
            ?.reserve?.underlyingAsset?.toLocaleLowerCase() &&
        chain?.id === ethereumProvider?.network?.chainId
    ) || {};

  const { balance: walletBalanceWETH = 0 } =
    assets?.find(
      ({ contractAddress, chain = {} }) =>
        contractAddress?.toLocaleLowerCase() ===
          strategy?.step
            .find(
              (s) =>
                s.type === "borrow" && s.from.toLocaleLowerCase() === "weth"
            )
            ?.reserve?.underlyingAsset?.toLocaleLowerCase() &&
        chain?.id === ethereumProvider?.network?.chainId
    ) || {};

  const maxToDeposit = !strategy?.step[1].reserve
    ? 0
    : +getMaxAmountAvailableToSupply(
        `${Number(walletBalanceWSTETH)}`,
        strategy?.step[1].reserve,
        strategy?.step[1].reserve.underlyingAsset,
        minBaseTokenRemaining
      );

  const maxToBorrow = !strategy?.step[2].reserve
    ? 0
    : +getMaxAmountAvailableToBorrow(
        strategy.step[2].reserve,
        strategy.userSummaryAndIncentives,
        InterestRate.Variable
      );

  console.log({
    maxToDeposit,
    maxToBorrow,
    walletBalanceWSTETH,
    walletBalanceWETH,
    strategy,
  });
  
  useEffect(()=> {
    if (!ethereumProvider) {
      return;
    }
    getETHByWstETH(1)
      .then(value => {
        setWstToEthAmount(()=> Number(value));
      });
  }, [ethereumProvider]);

  useEffect(()=> {
    setInputSwapValue(()=> 0);
  }, [stepIndex]);

  if (!strategy) {
    return <IonSpinner name="dots" />;
  }

  return (
    <IonGrid>
      {/* <!-- Steps Proccess Component --> */}
      <IonRow class="ion-text-center ion-padding-top ion-padding-horizontal"  style={{position: 'relative'}}>
        {dismiss && (
          <IonCol size="12" class="ion-text-end" style={{marginBottom: '-2rem'}}>
            <IonButton
              size="small"
              fill="clear"
              style={{
                zIndex: '1',
                position: 'absolute',
                right: 0,
                top: 0,
              }}
              onClick={async () =>  {
                dismiss(null, "cancel");
              }}
            >
              <IonIcon slot="icon-only" icon={closeSharp}></IonIcon>
            </IonButton>
          </IonCol>
        )}
        <IonCol size="12" class="ion-text-center">
          <IonLabel>
            Strategy Steps{" "}
            <small>
              ({stepIndex + 1 > 4 ? 4 : stepIndex + 1}/{4})
            </small>
          </IonLabel>
        </IonCol>
      </IonRow>
      <IonRow class="ion-text-center ion-padding-horizontal stepsProccess ion-margin-bottom">
        <IonGrid>
          <IonRow>
            <IonCol
              size="12"
              size-md="8"
              offset-md="2"
              size-xl="8"
              offset-xl="2"
            >
              <IonRow>
                <IonCol
                  onClick={() => setStepIndex(() => 0)}
                  size="3"
                  class={stepIndex >= 0 ? "checked" : ""}
                >
                  <span
                    className={
                      stepIndex === 0 ? "stepNumber active" : "stepNumber"
                    }
                  >
                    1
                  </span>
                </IonCol>
                <IonCol
                  onClick={() => setStepIndex(() => 1)}
                  size="3"
                  class={stepIndex >= 1 ? "checked" : ""}
                >
                  <span
                    className={
                      stepIndex === 1 ? "stepNumber active" : "stepNumber"
                    }
                  >
                    2
                  </span>
                </IonCol>
                <IonCol
                  onClick={() => setStepIndex(() => 2)}
                  size="3"
                  class={stepIndex >= 2 ? "checked" : ""}
                >
                  <span
                    className={
                      stepIndex === 2 ? "stepNumber active" : "stepNumber"
                    }
                  >
                    3
                  </span>
                </IonCol>
                <IonCol
                  onClick={() => setStepIndex(() => 3)}
                  size="3"
                  class={stepIndex >= 3 ? "checked" : ""}
                >
                  <span
                    className={
                      stepIndex === 3 ? "stepNumber active" : "stepNumber"
                    }
                  >
                    4
                  </span>
                </IonCol>
              </IonRow>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonRow>

      {/* Swap */}
      {(stepIndex === 0 || stepIndex === 3) && (
        <IonRow class="ion-text-center ion-padding-horizontal ion-padding-bottom">
          <IonCol
            size="12"
            class="ion-padding-start ion-padding-end ion-padding-bottom"
          >
            <IonText>
              <h2>{strategy?.step?.[0]?.title}</h2>
            </IonText>
            <IonText color="medium">
              <p>{strategy?.step?.[0]?.description}</p>
            </IonText>
          </IonCol>
          <IonCol
            size-xs="12"
            size-md="6"
            class="ion-padding-horizontal ion-text-start"
          >
            <AssetInput 
              symbol={strategy.step[0].from } 
              balance={inputSwapValue} 
              maxBalance={walletBalanceWETH.toString()} 
              textBalance={'Balance'}
              onChange={(value) => {
                const amount = Number(value);
                setInputSwapValue(() => amount);
              }} />
            {/* <IonItem lines="none" style={{'--padding-start': 0, '--inner-padding-end': 0}}>
              <IonThumbnail slot="start" style={{
                width: '48px',
                height: '48px',
                marginTop: '0.5rem',
                marginBottom: '0.5rem', 
                marginLeft: '0.5rem', 
              }}>
                <IonImg
                  src={getAssetIconUrl({ symbol: strategy.step[0].from })}
                  alt={strategy.step[0].from}
                ></IonImg>
              </IonThumbnail>
              <IonLabel slot="start" class="ion-hide-md-down">
                <h2>{strategy.step[0].from}</h2>
                <p>
                  <small>
                  Balance: {walletBalanceWETH}
                  </small>
                </p>
              </IonLabel>
              <IonInput
                // ref={inputSwapRef}
                class="ion-text-end"
                slot="end"
                type="number"
                debounce={500}
                placeholder="0"
                enterkeyhint="done"
                inputmode="numeric"
                min="0"
                max={walletBalanceWETH}
                onInput={(e) => {
                  const value = Number(e.currentTarget.value);
                  setInputSwapValue(() => value);
                }}
              ></IonInput>
            </IonItem> */}
          </IonCol>
          <IonCol
            size-xs="12"
            size-md="6"
            class="ion-padding-horizontal ion-text-end"
          >
            <AssetInput 
              disabled={true}
              symbol={strategy.step[0].to } 
              balance={((inputSwapValue||0) * wstToEthAmount) > 0 
                ? +((inputSwapValue||0) * wstToEthAmount).toFixed(4)
                : 0
              } 
              onChange={(value) => {
                const amount = Number(value);
                setInputSwapValue(() => amount);
            }} />
            {/* <IonItem lines="none" style={{ opacity: 1, '--padding-start': 0, '--inner-padding-end': 0 }} disabled={true}>
              <IonThumbnail slot="start" style={{
                width: '48px',
                height: '48px',
                marginTop: '0.5rem',
                marginBottom: '0.5rem',
                marginLeft: '0.5rem', 
              }}>
                <IonImg
                  src={getAssetIconUrl({ symbol: strategy.step[0].to })}
                  alt={strategy.step[0].to}
                ></IonImg>
              </IonThumbnail>
              <IonLabel slot="start" class="ion-hide-md-down" style={{marginRight: 0}}>
                <h2>{strategy.step[0].to}</h2>
                <p>
                  <small>
                  1 {strategy.step[0].to} = ~{wstToEthAmount > 0 ? wstToEthAmount.toFixed(4) : 0} {strategy.step[0].from}
                  </small>
                </p>
              </IonLabel>
              <IonInput
                class="ion-text-end"
                type="number"
                debounce={500}
                placeholder="0"
                enterkeyhint="done"
                inputmode="numeric"
                min="0"
                value={((inputSwapValue||0) * wstToEthAmount) > 0 
                  ? ((inputSwapValue||0) * wstToEthAmount).toFixed(4)
                  : 0
                }
              ></IonInput>
            </IonItem> */}
          </IonCol>
          <IonCol size="12" class="ion-padding-horizontal ion-padding-bottom">
          <IonText color="primary">
              <p style={{margin: '0 0 1rem'}}>
                <small>
                  {`1 ${strategy.step[0].to} = ~${wstToEthAmount > 0 ? wstToEthAmount.toFixed(4) : 0} ${strategy.step[0].from}`}
                </small>
              </p>
            </IonText>
            <IonText color="medium">
              <small>{noticeMessage("AAVE")}</small>
            </IonText>
          </IonCol>
          <IonCol size="12" className="ion-padding-top">
            <IonButton
              className="ion-margin-top"
              expand="block"
              onClick={async () => {
                await displayLoader();
                try {
                  const { txReceipts } = await ACTIONS.handleSwap(
                    strategy,
                    Number(inputSwapValue || -1),
                    walletBalanceWETH,
                    ethereumProvider as ethers.providers.Web3Provider
                  )
                  await refreshUser();
                  await refreshAAVE();
                  if ((txReceipts?.length || 0) > 0) {
                    await presentToast({
                      message: `Swap completed successfully`,
                      duration: 5000,
                      color: "success",
                    });
                    setStepIndex(() => (stepIndex === 3 ? 4 : 1));
                  }
                } catch (error: any) {
                  console.log("handleSwap:", { error });
                  await presentToast({
                    message: `[ERROR] Exchange Failed with reason: ${error?.message||error}`,
                    color: "danger",
                    duration: 5000,
                    buttons: [
                      { text: 'x', role: 'cancel', handler: () => {
                        dismissToast();
                      }}
                    ]
                  });
                }
                await hideLoader();
              }}
            >
              Swap
            </IonButton>
          </IonCol>
        </IonRow>
      )}

      {/* Deposit */}
      {stepIndex === 1 && (
        <IonRow class="ion-text-center ion-padding-horizontal ion-padding-bottom">
          <IonCol
            size="12"
            class="ion-padding-start ion-padding-end ion-padding-bottom"
          >
            <IonText>
              <h2>{strategy.step[1].title}</h2>
            </IonText>
            <IonText color="medium">
              <p>{strategy.step[1].description}</p>
            </IonText>
          </IonCol>
          <IonCol size="12" class="ion-padding-horizontal ion-text-end">
            <AssetInput 
              symbol={strategy.step[1].from } 
              balance={inputDepositValue} 
              maxBalance={maxToDeposit.toString()} 
              textBalance={'Balance'}
              onChange={(value) => {
                const amount = Number(value);
                setInputDepositValue(() => amount);
              }} />
            {/* <IonItem lines="none" style={{'--padding-start': 0, '--inner-padding-end': 0}}>
              <IonThumbnail slot="start" style={{
                width: '48px',
                height: '48px',
                marginTop: '0.5rem',
                marginBottom: '0.5rem',
                marginLeft: '0.5rem', 
              }}>
                <IonImg
                  src={getAssetIconUrl({ symbol: strategy.step[1].from })}
                  alt={strategy.step[1].from}
                ></IonImg>
              </IonThumbnail>
              <div slot="start" className="ion-hide-md-down">
                <h2 style={{fontSize: '1.2rem'}} className="ion-no-margin">{strategy.step[1].from}</h2>
                <IonText color="medium" style={{display: 'flex', fontSize: '70%', cursor: 'pointer'}} onClick={() => {
                  console.log('hii', maxToDeposit.toString());
                  (inputDepositRef.current as any).value = maxToDeposit.toString();
                }}>
                  <span style={{paddingRight: '0.25rem'}}>Balance:</span>
                  <FormattedNumber value={maxToDeposit} />
                </IonText>
              </div>
              <IonInput
                ref={inputDepositRef}
                class="ion-text-end"
                type="number"
                debounce={500}
                placeholder="0"
                enterkeyhint="done"
                inputmode="numeric"
                min={0}
                max={maxToDeposit}
                style={{fontSize: '1.25rem'}}
              ></IonInput>
            </IonItem> */}
          </IonCol>
          <IonCol size="12" class="ion-padding ion-margin-top">
            <IonText color="medium">
              <small>
                {noticeMessage(strategy.step[2].protocol.toUpperCase())}
              </small>
            </IonText>
          </IonCol>
          <IonCol size="12" className="ion-padding-top" >
            {/* Event Button */}
            <IonButton
              className="ion-margin-top"
              expand="block"
              onClick={async () => {
                console.log('inputDepositValue', inputDepositValue);
                // return;
                await displayLoader();
                try {
                  const { txReceipts } = await ACTIONS.handleDeposit(
                    strategy,
                    Number(inputDepositValue || -1),
                    ethereumProvider as ethers.providers.Web3Provider
                  );
                  await refreshUser();
                  await refreshAAVE();
                  if ((txReceipts?.length || 0) > 0) {
                    await presentToast({
                      message: `Deposit completed successfully`,
                      duration: 5000,
                      color: "success",
                    });
                    setStepIndex(() => 2);
                    setInputDepositValue(0)
                  }
                } catch (error: any) {
                  console.log("handleDeposit:", { error });
                  await presentToast({
                    message: `[ERROR] Deposit Failed with reason: ${error?.reason||error?.message||error}`,
                    color: "danger",
                    duration: 5000,
                    buttons: [
                      { text: 'x', role: 'cancel', handler: () => {
                        dismissToast();
                      }}
                    ]
                  });
                }
                await hideLoader();
              }}
            >
              Deposit
            </IonButton>
          </IonCol>
        </IonRow>
      )}

      {/* Borrow */}
      {stepIndex === 2 && (
        <IonRow class="ion-text-center ion-padding-horizontal ion-padding-bottom">
          <IonCol
            size="12"
            class="ion-padding-start ion-padding-end ion-padding-bottom"
          >
            <IonText>
              <h2>{strategy.step[2].title}</h2>
            </IonText>
            <IonText color="medium">
              <p>{strategy.step[2].description}</p>
            </IonText>
          </IonCol>
          <IonCol size="12" class="ion-padding-horizontal ion-text-end">
            <AssetInput 
              symbol={strategy.step[2].from } 
              balance={inputBorrowtValue} 
              maxBalance={maxToBorrow.toString()} 
              textBalance={'Balance'}
              onChange={(value) => {
                console.log('onChange', {value, maxToBorrow});
                const amount = Number(value);
                setInputBorrowtValue(() => amount);
              }} />
            {/* <IonItem lines="none" style={{'--padding-start': 0, '--inner-padding-end': 0}}>
              <IonThumbnail slot="start" style={{
                width: '48px',
                height: '48px',
                marginTop: '0.5rem',
                marginBottom: '0.5rem',
                marginLeft: '0.5rem', 
              }}>
                <IonImg
                  src={getAssetIconUrl({ symbol: strategy.step[2].from })}
                  alt={strategy.step[2].from}
                ></IonImg>
              </IonThumbnail>
              <IonLabel slot="start" class="ion-hide-md-down">
                <h2>{strategy.step[2].from}</h2>
                <p
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    console.log(">", inputBorrowRef?.current?.value);
                    if (inputBorrowRef?.current?.value) {
                      inputBorrowRef.current.value = maxToBorrow.toString();
                    }
                  }}
                >
                  Max amount: {maxToBorrow}
                </p>
              </IonLabel>
              <IonInput
                ref={inputBorrowRef}
                class="ion-text-end"
                slot="end"
                type="number"
                debounce={500}
                placeholder="0"
                enterkeyhint="done"
                inputmode="numeric"
                min="0"
                max={maxToBorrow}
              ></IonInput>
            </IonItem> */}
          </IonCol>
          <IonCol size="12" class="ion-padding ion-margin-top">
            <IonText color="medium">
              <small>
                {noticeMessage(strategy.step[2].protocol.toUpperCase())}
              </small>
            </IonText>
          </IonCol>
          <IonCol size="12" className="ion-padding-top">
            {/* Event Button */}
            <IonButton
              className="ion-margin-top"
              expand="block"
              onClick={async () => {
                await displayLoader();
                try {
                  const { txReceipts } = await ACTIONS.handleBorrow(
                    strategy,
                    Number(inputBorrowtValue || -1),
                    ethereumProvider as ethers.providers.Web3Provider
                  );
                  await refreshUser();
                  await refreshAAVE();
                  if ((txReceipts?.length || 0) > 0) {
                    await presentToast({
                      message: `Borrow completed successfully`,
                      duration: 5000,
                      color: "success",
                    });
                    setStepIndex(() => 3);
                    setInputBorrowtValue(0);
                  }
                } catch (error: any) {
                  await presentToast({
                    message: `[ERROR] Borrow Failed with reason: ${error?.message||error}`,
                    color: "danger",
                    duration: 5000,
                    buttons: [
                      { text: 'x', role: 'cancel', handler: () => {
                        dismissToast();
                      }}
                    ]
                  });
                }
                await hideLoader();
              }}
            >
              Borrow
            </IonButton>
          </IonCol>
        </IonRow>
      )}

      {/* Congratulation */}
      {stepIndex === 4 && (
        <IonRow class="ion-text-center ion-padding-horizontal ion-padding-bottom">
          <IonCol
            size="12"
            class="ion-padding-start ion-padding-end ion-padding-bottom"
          >
            <IonText>
              <h2>Congratulation</h2>
            </IonText>
            <IonText color="medium">
              <p>You have successfully completed {strategy.name} strategy.</p>
              <p>
                Now you can use your wstETH wallet amount sold to provide
                liquidity on the{" "}
                {strategy.step
                  .find((s) => s.type === "deposit")
                  ?.protocol?.toLocaleUpperCase()}{" "}
                pool to repeat the process from step 2 and grow you deposit
                amount to allow you to borrow more WETH to swap and incrase your
                stakng reward APY till you reach{" "}
                {userLiquidationThreshold * 100}% LTV. on{" "}
                {strategy.step
                  .find((s) => s.type === "deposit")
                  ?.protocol?.toLocaleUpperCase()}
              </p>
            </IonText>
          </IonCol>

          <IonCol size="12" className="ion-padding-top">
            {/* Event Button */}
            <IonButton
              className="ion-margin-top"
              expand="block"
              onClick={async () => {
                if (!ethereumProvider) {
                  return;
                }
                setStepIndex(() => 1);
              }}
            >
              Repeat Strategy
            </IonButton>
          </IonCol>
        </IonRow>
      )}
    </IonGrid>
  );
}

export function EthOptimizedStrategyCard() {
  const strategy = useEthOptimizedStrategy();
  const { user, assets } = useUser();
  // const [present, dismiss] = useIonModal(EthOptimizedStrategyModal, {
  //   strategy,
  //   onDismiss: (data: string, role: string) => dismiss(data, role),
  // });
  const modal = useRef<HTMLIonModalElement>(null);
  const baseAPRstETH = !strategy ? -1 : Number(strategy.apys[0]);
  const maxAPRstETH = !strategy ? -1 : Number(strategy.apys[1]);
  const poolReserveWSTETH = strategy?.step?.find(
    (s) =>
      s?.reserve?.symbol?.toLocaleLowerCase() === "wsteth" &&
      s?.type === "deposit"
  )?.reserve;
  const poolReserveWETH = strategy?.step?.find(
    (s) =>
      s?.reserve?.symbol?.toLocaleLowerCase() === "weth" && 
      s?.type === "borrow"
  )?.reserve;
  const chain = CHAIN_AVAILABLES.find(c => c.id === strategy?.chainId);
  const isDisabled = isAavePoolDisabled({ poolReserveWSTETH, poolReserveWETH });

  // UI Component utils
  const Loader = <IonSpinner name="dots" />;
  const CardButton = !user ? (
    <ConnectButton expand="block" />
  ) : (
    <IonButton
      disabled={isDisabled}
      onClick={() => 
        {
          modal.current?.present();
        }
      }
      expand="block"
      color="primary"
    >
      Start Earning
    </IonButton>
  );

  // Component Render
  return !strategy ? (
    Loader
  ) : (
    <IonCol size="auto">
      <IonCard style={{ maxWidth: 350 }}>
        <IonGrid>
          <IonRow class="ion-text-center">
            <IonCol size="12" class="ion-padding">
              <IonImg
                style={{
                  padding: "0 2rem",
                  maxWidth: 200,
                  maxHeight: 200,
                  margin: "1rem auto 0",
                }}
                src={strategy.icon}
              />
            </IonCol>
            <IonCol size="12" class="ion-padding-top">
              <h1 className="ion-no-margin">
                <IonText color="primary">{strategy.name}</IonText>
                <br />
                <small>Strategy</small>
              </h1>
            </IonCol>
          </IonRow>
          <IonRow class="ion-padding">
            <IonCol class="ion-padding">
              <IonItem
                style={{
                  "--background": "transparent",
                  "--inner-padding-end": "none",
                  "--padding-start": "none",
                }}
              >
                <IonLabel>
                  Assets <small>{strategy.isStable ? "(stable)" : null}</small>
                </IonLabel>
                <div slot="end" style={{ display: "flex" }}>
                  {strategy.assets.map((symbol, index) => (
                    <IonImg
                      key={index}
                      style={{
                        width: 28,
                        height: 28,
                        transform: index === 0 ? "translateX(5px)" : "none",
                      }}
                      src={getAssetIconUrl({ symbol })}
                      alt={symbol}
                    />
                  ))}
                </div>
              </IonItem>
              <IonItem
                lines="none"
                style={{
                  "--background": "transparent",
                  "--inner-padding-end": "none",
                  "--padding-start": "none",
                }}
              >
                <IonLabel>APY</IonLabel>
                {maxAPRstETH > 0 ? (
                  <IonText slot="end">{strategy.apys.map(a => (`${a}%`)).join(" - ")}</IonText>
                ) : (
                  <IonSkeletonText
                    animated
                    style={{ width: "6rem" }}
                    slot="end"
                  ></IonSkeletonText>
                )}
              </IonItem>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="12" class="ion-padding-horizontal ion-padding-bottom">
              {CardButton}
              {isDisabled && (
                <div className="ion-margin-top">
                  <IonText color="warning">
                    Reserve liquidity pool is full on  {
                      chain && (chain?.name[0].toUpperCase() + chain?.name.slice(1))
                    }. Try again
                    later or switch to another network.
                  </IonText>
                </div>
              )}
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonCard>

      <IonModal 
        ref={modal} 
        trigger="open-modal" 
        onWillDismiss={async (ev: CustomEvent<OverlayEventDetail>) => {
          console.log("will dismiss", ev.detail);
        }}
        style={{
          '--height': 'auto',
          '--max-height': '90vh',
          '--border-radius': '32px',
        }}>
        <EthOptimizedStrategyModal dismiss={
          (data?: any, role?: string | undefined) => modal.current?.dismiss(data, role)
        } />
      </IonModal>

    </IonCol>
  );
}
