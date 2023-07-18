import { IonButton, IonCard, IonCol, IonGrid, IonImg, IonInput, IonItem, IonLabel, IonRow, IonText, IonThumbnail, useIonModal, IonSkeletonText } from "@ionic/react";
import { getAssetIconUrl } from "../utils/getAssetIconUrl";
import { useEffect, useRef, useState } from "react";
import { OverlayEventDetail } from "@ionic/react/dist/types/components/react-component-lib/interfaces";
import { ethers } from "ethers";
import { getMaxAmountAvailableToSupply } from "../utils/getMaxAmountAvailableToSupply";
import { borrow, supplyWithPermit } from "../servcies/aave.service";
import { useLoader } from "../context/LoaderContext";
import { useUser } from "../context/UserContext";
import { useAave } from "../context/AaveContext";
import { useEthersProvider } from "../context/Web3Context";
import { ChainId, InterestRate, ReserveDataHumanized } from "@aave/contract-helpers";
import { getMaxAmountAvailableToBorrow } from "../utils/getMaxAmountAvailableToBorrow";
import { FormatReserveUSDResponse, FormatUserSummaryAndIncentivesResponse, valueToBigNumber } from "@aave/math-utils";
import { getPercent } from "../utils/utils";
import { swapWithLiFi } from "../servcies/lifi.service";
import { getBaseAPRstETH } from "../servcies/lido.service";

export const minBaseTokenRemainingByNetwork: Record<number, string> = {
  [ChainId.optimism]: "0.0001",
  [ChainId.arbitrum_one]: "0.0001",
};

interface IStrategy {
  chainId: number;
  name: string;
  icon: string;
  apys: string[];
  locktime: number,
  providers: string[],
  assets: string[],
  isStable: boolean,
  details: {
    description: string;
  },
  poolAddress: string;
  gateway: string;
  userSummaryAndIncentives: FormatUserSummaryAndIncentivesResponse<ReserveDataHumanized & FormatReserveUSDResponse>;
  step: {
    type: string;
    from: string;
    to: string;
    title:string;
    description: string;
    protocol: string
    reserve?: (ReserveDataHumanized & FormatReserveUSDResponse);
    }[]
}

// Function that calcule maximum borrow/supply multiplicator user can do based on 
// The Maximum LTV ratio represents the maximum borrowing power of a specific collateral. 
// For example, if a collateral has an LTV of 75%, the user can borrow up to 0.75 worth of ETH in the principal currency for every 1 ETH worth of collateral.
const getMaxLeverageFactor = (ltv: number) => {
  // The Maximum LTV ratio is calculated as follows:
  // Maximum LTV = 1 / (1 - LTV)
  // For example, if the LTV is 75%, the maximum LTV is 1 / (1 - 0.75) = 4.
  return 1 / (1 - ltv);
}

function StrategyModal({
  strategy,
  onDismiss,
  onDeposit,
  onBorrow,
  onSwap,
}: {
  strategy: IStrategy,
  onDismiss: (data?: string | null | undefined | number, role?: string) => void;
  onDeposit: (ops: {
    strategy: IStrategy;
    provider: ethers.providers.Web3Provider;
    amount: number;
  }) => Promise<{
    txReceipts: ethers.providers.TransactionReceipt[];
  }>;
  onBorrow: (ops: {
    strategy: IStrategy;
    provider: ethers.providers.Web3Provider;
    amount: number;
  }) => Promise<{
    txReceipts: ethers.providers.TransactionReceipt[];
  }>;
  onSwap: (ops: {
    strategy: IStrategy;
    provider: ethers.providers.Web3Provider;
    amount: number;
  }) => Promise<{
    txReceipts: ethers.providers.TransactionReceipt[];
  }>;
}) {  
  const { ethereumProvider } = useEthersProvider();
  const { display: displayLoader, hide: hideLoader } = useLoader();
  const [step, setStep] = useState(0);  
  // create ref for input deposit, borrow, swap
  const inputDepositRef = useRef<HTMLIonInputElement>(null);
  const inputBorrowRef = useRef<HTMLIonInputElement>(null);
  const inputSwapRef = useRef<HTMLIonInputElement>(null);

  const noticeMessage = (name: string) => `Our strategies leverage and connect to ${name?.toUpperCase()} protocol smart contracts without any third-party involvement, providing a trustless and completely transparent experience.
  Rest assured, our solutions are non-custodial, allowing you to withdraw your assets at any time. Control remains in your hands!`;

  const { user, assets } = useUser();

  const minBaseTokenRemaining =
          minBaseTokenRemainingByNetwork[
            ethereumProvider?.network?.chainId || 137
          ] || "0.001";
  const { balance: walletBalanceWSTETH = 0 } =
    assets?.find(
      ({ contractAddress, chain = {} }) =>
        contractAddress?.toLocaleLowerCase() ===
        strategy.step.find(s => s.type === 'deposit')?.reserve?.underlyingAsset?.toLocaleLowerCase() &&
        chain?.id === ethereumProvider?.network?.chainId
    ) || {};
  const { balance: walletBalanceWETH = 0 } =
  assets?.find(
    ({ contractAddress, chain = {} }) =>
      contractAddress?.toLocaleLowerCase() ===
      strategy.step.find(s => s.type === 'borrow')?.reserve?.underlyingAsset?.toLocaleLowerCase() &&
      chain?.id === ethereumProvider?.network?.chainId
  ) || {};
  const maxToDeposit = !strategy.step[1].reserve
    ? 0
    : +getMaxAmountAvailableToSupply(
      `${Number(walletBalanceWSTETH)}`,
      strategy.step[1].reserve,
      strategy.step[1].reserve.underlyingAsset,
      minBaseTokenRemaining
    );
  const maxToBorrow = !strategy.step[2].reserve
    ? 0
    : +getMaxAmountAvailableToBorrow(
        strategy.step[2].reserve,
        strategy.userSummaryAndIncentives,
        InterestRate.Variable
      );
  console.log({maxToDeposit, maxToBorrow, walletBalanceWSTETH, walletBalanceWETH});
  
  return (
    <IonGrid>
      
      {/* <!-- Steps Proccess Component --> */}
      <IonRow class="ion-text-center ion-padding-top ion-padding-horizontal">
        <IonCol size="12" class="ion-text-center">
          <IonLabel>Strategy Steps <small>({step + 1}/{4})</small></IonLabel>
        </IonCol>
      </IonRow>

      <IonRow class="ion-text-center ion-padding-horizontal stepsProccess ion-margin-bottom">
        <IonGrid>
          <IonRow>
            <IonCol size="12" size-md="8" offset-md="2" size-xl="8" offset-xl="2">
              <IonRow>
                <IonCol onClick={()=> setStep(() => 0)} size="3" class={step >= 0 ? 'checked' : ''}>
                  <span className={step === 0 ? 'stepNumber active' : 'stepNumber'}>1</span>
                </IonCol>
                <IonCol onClick={()=> setStep(() => 1)} size="3" class={step >= 1 ? 'checked' : ''}>
                  <span className={ step === 1 ? 'stepNumber active' : 'stepNumber'}>2</span>
                </IonCol>
                <IonCol onClick={() => setStep(() => 2)} size="3" class={ step >= 2 ? 'checked' : ''}>
                  <span className={ step === 2 ? 'stepNumber active' : 'stepNumber'}>3</span>
                </IonCol>
                <IonCol onClick={() => setStep(() => 3)} size="3" class={ step >= 3 ? 'checked' : ''}>
                  <span className={ step === 3 ? 'stepNumber active' : 'stepNumber'}>4</span>
                </IonCol>
              </IonRow>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonRow>

      {/* Swap */}
      {(step === 0  || step === 3) && (
        <IonRow class="ion-text-center ion-padding-horizontal ion-padding-bottom">
          <IonCol size="12" class="ion-padding-start ion-padding-end ion-padding-bottom">
            <IonText>
              <h2>{strategy.step[0].title}</h2>
            </IonText>
            <IonText color="medium">
              <p>{strategy.step[0].description}</p>
            </IonText>
          </IonCol>
          <IonCol size-xs="12" size-md="6" class="ion-padding-horizontal ion-text-start">
            <IonItem lines="none">
              <IonThumbnail slot="start">
                <IonImg src={getAssetIconUrl({symbol: strategy.step[0].from})} alt={strategy.step[0].from}></IonImg>
              </IonThumbnail>
              <IonLabel slot="start" class="ion-hide-md-down">
                <h2>{strategy.step[0].from}</h2>
                <p>Balance: {walletBalanceWETH}</p>
              </IonLabel>
              <IonInput
                ref={inputSwapRef}
                class="ion-text-end"
                slot="end"
                type="number"
                debounce={500}
                placeholder="0"
                enterkeyhint="done"
                inputmode="numeric"
                min="0"
                max={walletBalanceWETH}
              ></IonInput>
            </IonItem>
          </IonCol>
          <IonCol size-xs="12" size-md="6" class="ion-padding-horizontal ion-text-end" onClick={()=> console.log({strategy})} >
            <IonItem lines="none" style={{opacity:1}} disabled={true}>
              <IonThumbnail slot="start">
                <IonImg src={getAssetIconUrl({symbol: strategy.step[0].to})} alt={strategy.step[0].to}></IonImg>
              </IonThumbnail>
              <IonLabel slot="start" class="ion-hide-md-down">
                <h2>{strategy.step[0].to}</h2>
                <p>
                  1 {strategy.step[0].from} = 1 {strategy.step[0].to}
                </p>
              </IonLabel>
              <IonInput
                class="ion-text-end"
                slot="end"
                type="number"
                debounce={500}
                placeholder="0"
                enterkeyhint="done"
                inputmode="numeric"
                min="0"
                value={0}
              ></IonInput>
            </IonItem>
          </IonCol>
          <IonCol size="12" class="ion-padding ion-margin-top">
            <IonText color="medium">
              <small>{noticeMessage('AAVE')}</small>
            </IonText>
          </IonCol>
          <IonCol size="12" className="ion-padding-top">
            <IonButton className="ion-margin-top" expand="block" onClick={async () => {
              if (!ethereumProvider) {
                return;
              }
              // verify max amount
              if (inputSwapRef.current?.value && +inputSwapRef.current?.value >= walletBalanceWETH) {
                console.error({message:`Invalid amount: ${inputSwapRef.current?.value}. Value must be less or equal than your balance.`});
                return;
              }
              await displayLoader();
              const {txReceipts, ...error} = await onSwap({
                strategy,
                provider: ethereumProvider,
                amount: inputSwapRef.current?.value ? +inputSwapRef.current?.value : 0
              })
              .catch((error: any) => {
                return {txReceipts: undefined, message: error?.message||error}
              })
              console.log('xxxxx', {txReceipts, error});
              hideLoader();
              if (error) {
                console.error({error});
                return
              }
              setStep(() => 1);
            }}>
              Swap
            </IonButton>
          </IonCol>
        </IonRow>
      )}

      {/* Deposit */}
      {step === 1 && (
        <IonRow class="ion-text-center ion-padding" >
          <IonCol size="12" size-md="10" offset-md="1" size-xl="8" offset-xl="2" class="ion-padding-start ion-padding-end">
            <IonText>
              <h2>{strategy.step[1].title}</h2>
            </IonText>
            <IonText color="medium">
              <p>{strategy.step[1].description}</p>
            </IonText>
          </IonCol>
          <IonCol size="12" class="ion-padding-horizontal ion-text-end">
            <IonItem lines="none">
              <IonThumbnail slot="start">
                <IonImg src={getAssetIconUrl({symbol: strategy.step[1].from})} alt={strategy.step[1].from}></IonImg>
              </IonThumbnail>
              <IonLabel slot="start" class="ion-hide-md-down">
                <h2>{strategy.step[1].from}</h2>
                <p>Balance: {maxToDeposit}</p>
              </IonLabel>
              <IonInput
                ref={inputDepositRef}
                class="ion-text-end"
                slot="end"
                type="number"
                debounce={500}
                placeholder="0"
                enterkeyhint="done"
                inputmode="numeric"
                min="0"
                max={maxToDeposit}
              ></IonInput>
            </IonItem>
          </IonCol>
          <IonCol size="12" class="ion-padding ion-margin-top">
            <IonText color="medium">
              <small>{noticeMessage(strategy.step[2].protocol.toUpperCase())}</small>
            </IonText>
          </IonCol>
          <IonCol size="12" className="ion-padding-top">
            {/* Event Button */}
            <IonButton className="ion-margin-top" expand="block" onClick={async ()=> {
              if (!ethereumProvider) {
                return;
              }
              await displayLoader();
              const {txReceipts, ...error} = await onDeposit({
                strategy,
                provider: ethereumProvider,
                amount: inputDepositRef.current?.value ? +inputDepositRef.current?.value : 0
              })
              .catch(error => {
                return error
              });
              hideLoader();
              console.log('xxxxx', {txReceipts, error});
              if (error) {
                console.error({error});
                return
              }
              setStep(() => 2);
            }}>
              Deposit
            </IonButton>
          </IonCol>
        </IonRow>
      )}

      {/* Borrow */}
      {step === 2 && (
        <IonRow class="ion-text-center ion-padding" >
          <IonCol size="12" size-md="10" offset-md="1" size-xl="8" offset-xl="2" class="ion-padding-start ion-padding-end">
          <IonText>
              <h2>{strategy.step[2].title}</h2>
            </IonText>
            <IonText color="medium">
              <p>{strategy.step[2].description}</p>
            </IonText>
          </IonCol>
          <IonCol size="12" class="ion-padding-horizontal ion-text-end">
            <IonItem lines="none">
              <IonThumbnail slot="start">
                <IonImg src={getAssetIconUrl({symbol: strategy.step[2].from})} alt={strategy.step[2].from}></IonImg>
              </IonThumbnail>
              <IonLabel slot="start" class="ion-hide-md-down">
                <h2>{strategy.step[2].from}</h2>
                <p style={{cursor: 'pointer'}} onClick={()=> {
                  console.log('>',inputBorrowRef?.current?.value);
                  if (inputBorrowRef?.current?.value) {
                    (inputBorrowRef.current.value = maxToBorrow.toString())
                  }
                }}>Max amount: {maxToBorrow}</p>
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
            </IonItem>
          </IonCol>        
          <IonCol size="12" class="ion-padding ion-margin-top">
            <IonText color="medium">
              <small>{noticeMessage(strategy.step[2].protocol.toUpperCase())}</small>
            </IonText>
          </IonCol>
          <IonCol size="12" className="ion-padding-top">
            {/* Event Button */}
            <IonButton className="ion-margin-top" expand="block" onClick={async ()=> {
              if (!ethereumProvider) {
                return;
              }
              await displayLoader();
              const { txReceipts, ...error} = await onBorrow({
                strategy,
                provider: ethereumProvider,
                amount: inputBorrowRef.current?.value ? +inputBorrowRef.current?.value : 0
              })
              .catch(error => {
                hideLoader();
                return error
              });
              console.log('[INFO] Borrow:', {txReceipts, error});
              if (error) {
                console.error({error});
                return
              }
              setStep(() => 3);
            }}>
              Borrow
            </IonButton>
          </IonCol>
        </IonRow>
      )}

      {step === 4 && (
        <IonRow class="ion-text-center ion-padding" >
          <IonCol size="12" size-md="10" offset-md="1" size-xl="8" offset-xl="2" class="ion-padding-start ion-padding-end">
          <IonText>
              <h2>Congratulation</h2>
            </IonText>
            <IonText color="medium">
              <p>
                You have successfully completed the {strategy.name} strategy.
              </p>
            </IonText>
          </IonCol>
        </IonRow>
      )}
    </IonGrid>
  )
}

export function Earn() {

  const { user, assets } = useUser();
  const { 
    poolReserves, 
    markets, 
    refresh, 
    userSummaryAndIncentives 
  } = useAave();
  const [baseAPRstETH, setBaseAPRstETH] = useState(0);

  const poolReserveWSTETH = poolReserves?.find(p => p.symbol === 'wstETH');
  const poolReserveWETH = poolReserves?.find(p => p.symbol === 'WETH');
  // calcul apr using `baseAPRstETH` and `poolReserveWETH.variableBorrowAPR * 100`
  const diffAPR = baseAPRstETH - Number(poolReserveWETH?.variableBorrowAPR||0) * 100;
  const threshold = Number(userSummaryAndIncentives?.currentLiquidationThreshold||0);
  const userLiquidationThreshold = Number( threshold === 0 
    ? poolReserveWETH?.formattedReserveLiquidationThreshold
    : userSummaryAndIncentives?.currentLiquidationThreshold
  );
  
  const maxLeverageFactor = getMaxLeverageFactor(userLiquidationThreshold);
  const maxAPRstETH = (diffAPR * maxLeverageFactor) + baseAPRstETH;

  const strategies: IStrategy[] = [
    {
      chainId: markets?.CHAIN_ID as number,
      name: "ETH Optimized",
      icon: getAssetIconUrl({symbol: 'ETH'}),
      apys: [`${baseAPRstETH.toFixed(2)}%`, `${maxAPRstETH.toFixed(2)}%`],
      locktime: 0,
      providers: ['aave', 'lido'],
      assets: ['WETH', 'wstETH'],
      isStable: true,
      details:{
        description: `This strategy will swap your ETH for wstETH and stake it in Aave to create collateral for the protocol that allow you to borrow ETH to leveraged against standard ETH to gain an increased amount of ETH POS staking reward.`
      },
      poolAddress: markets?.POOL as string,
      gateway: markets?.WETH_GATEWAY as string,
      userSummaryAndIncentives: userSummaryAndIncentives as FormatUserSummaryAndIncentivesResponse<ReserveDataHumanized & FormatReserveUSDResponse>,
      step: [
        {
          type: 'swap',
          from: 'WETH',
          to: 'wstETH',
          title: `Swap WETH to wstETH`,
          description: 'By swapping WETH to wstETH you will incrase your WETH holdings by 5% APY revard from staking WETH on Lido.',
          protocol: 'lido',
        },
        {
          type: 'deposit',
          from: 'wstETH',
          to: 'WETH',
          title: 'Deposit wstETH as collateral',
          description: 'By deposit wstETH as collateral on AAVE you will be able to borrow up to 75% of your wstETH value in WETH',
          protocol: 'aave',
          reserve: poolReserveWSTETH as (ReserveDataHumanized & FormatReserveUSDResponse),
        }, {
          type: 'borrow',
          from: 'WETH',
          to: 'WETH',
          title: 'Borrow WETH',
          description: 'By borrowing WETH on AAVE you will be able to increase your WETH holdings and use it for laverage stacking with wstETH.',
          protocol: 'aave',
          reserve: poolReserveWETH as (ReserveDataHumanized & FormatReserveUSDResponse),
        }
      ]
    }
  ];

  const onDepositToAAVE = async (
    ops: {
    strategy: IStrategy,
    provider: ethers.providers.Web3Provider,
    amount: number},
  ) => {
    const { strategy, provider, amount } = ops;
    const reserve = strategy.step.find(s => s.type === 'deposit')?.reserve
    if (!reserve) {
      throw new Error(
        "Invalid reserve"
      );
    }
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
  }

  const onBorrowFromAAVE = async (
    ops: {
    strategy: IStrategy,
    provider: ethers.providers.Web3Provider,
    amount: number},
  ) => {
    const { strategy, provider, amount } = ops;
    const reserve = strategy.step.find(s => s.type === 'borrow')?.reserve
    if (!reserve) {
      throw new Error(
        "Invalid reserve"
      );
    }
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
  }

  const onSwapWithLiFi = async (
    ops: {
    strategy: IStrategy,
    provider: ethers.providers.Web3Provider,
    amount: number},
  ) => {
    const { strategy, provider, amount } = ops;
    const stepDeposit = strategy.step.find(s => s.type === 'deposit');
    const stepBorrow = strategy.step.find(s => s.type === 'borrow');
    if (!stepDeposit||!stepBorrow) {
      throw new Error(
        "Invalid step"
      );
    }
    // handle invalid amount
    if (isNaN(amount) || amount <= 0) {
      throw new Error(
        "Invalid amount. Value must be greater than 0."
      );
    }
    // call method
    const fromAddress = await provider?.getSigner().getAddress();
    const receipt = await swapWithLiFi({
      fromAddress,
      fromAmount: amount.toString(),
      fromChain: provider.network.chainId.toString(),
      fromToken: stepBorrow.reserve?.underlyingAsset as string, // WETH
      toChain: provider.network.chainId.toString(),
      toToken: stepDeposit.reserve?.underlyingAsset as string, // wstETH
    }, provider);
    console.log("TX result: ", receipt);
    return { txReceipts: [receipt] };
  }

  const [present, dismiss] = useIonModal(StrategyModal, {
    strategy: strategies[0],
    onSwap: async ({...args}) => await onSwapWithLiFi(args as any),
    onDeposit: async ({...args}) => await onDepositToAAVE(args as any),
    onBorrow: async ({...args}) => await onBorrowFromAAVE(args as any),
    onDismiss: (data: string, role: string) => dismiss(data, role),
  });

  console.log('poolReserveWETH: ',{poolReserveWSTETH, poolReserveWETH, markets});
  
  const supplyPoolRatioInPercent = !poolReserveWSTETH
    ? 100
    : getPercent(
      valueToBigNumber(poolReserveWSTETH.totalLiquidityUSD).toNumber(),
      valueToBigNumber(poolReserveWSTETH.supplyCapUSD).toNumber()
    );

  useEffect(() => {
    getBaseAPRstETH().then(({apr}) => setBaseAPRstETH(() => apr));
  }, []);

  return (
    <IonGrid class="ion-no-padding" style={{ marginBottom: "5rem" }}>
      <IonRow class="ion-justify-content-center" >
        <IonCol size="12" size-md="12" size-lg="10" size-xl="10" class="ion-text-center">
        <IonText>
            <h1>
              Earn interest
            </h1>
          </IonText>
          <IonText color="medium">
            <p
              style={{
                lineHeight: "1.3rem",
              }}
            >
              <span style={{ maxWidth: "800px", display: "inline-block" }}>
              Unlock the full potential of your assets by earning interest through optimized liquid staking while simultaneously contributing to the network's security. 
              </span>
            </p>
          </IonText>
        </IonCol>
      </IonRow>
      <IonRow class="ion-justify-content-center">
        <IonCol class="ion-padding ion-text-center" size-md="12" size-lg="10" size-xl="10">
          <IonGrid class="ion-no-padding">
            <IonRow class="ion-justify-content-center">
              {strategies.map((strategy, index) => {
                return (
                  <IonCol size="auto" key={index}>
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
                                <IonText color="primary">
                                    {strategy.name}
                                </IonText>
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
                                Assets{" "}
                                <small>
                                  {strategy.isStable ? "(stable)" : null}
                                </small>
                              </IonLabel>
                              <div slot="end" style={{ display: "flex" }}>
                                {strategy.assets.map((symbol, index) => (
                                  <IonImg
                                    key={index}
                                    style={{
                                      width: 28,
                                      height: 28,
                                      transform:
                                        index === 0
                                          ? "translateX(5px)"
                                          : "none",
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
                              {maxAPRstETH > 0 
                              ? (
                              <IonText slot="end">
                                {strategy.apys.join(" - ")}
                              </IonText>
                              ):  (
                                <IonSkeletonText animated style={{width: '6rem'}} slot="end"></IonSkeletonText>
                              )}
                            </IonItem>
                          </IonCol>
                        </IonRow>
                        <IonRow>
                          <IonCol
                            size="12"
                            class="ion-padding-horizontal ion-padding-bottom"
                          >
                            <IonButton
                              disabled={supplyPoolRatioInPercent >= 99}
                              onClick={() =>
                                present({
                                  cssClass: "modalAlert ",
                                  onWillDismiss: async (
                                    ev: CustomEvent<OverlayEventDetail>
                                  ) => {
                                    console.log("will dismiss", ev.detail);
                                  },
                                })
                              }
                              expand="block"
                              color="primary"
                            >
                              Start Earning
                            </IonButton>
                              {maxAPRstETH > 0 && supplyPoolRatioInPercent >= 99 && (
                                <div className="ion-margin-top">
                                  <IonText color="warning">
                                    Reserve liquidity pool is full on this network. Try again later or switch to another network.
                                  </IonText>
                                </div>
                              )}
                          </IonCol>
                        </IonRow>
                      </IonGrid>
                    </IonCard>
                  </IonCol>
                );
              })}
            </IonRow>
          </IonGrid>
        </IonCol>
      </IonRow>
    </IonGrid>
  )
} 

