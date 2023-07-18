import { IonButton, IonCol, IonGrid, IonImg, IonInput, IonItem, IonLabel, IonRow, IonText, IonThumbnail } from "@ionic/react";
import { IStrategy } from "./Earn";
import { useEthersProvider } from "../context/Web3Context";
import { useLoader } from "../context/LoaderContext";
import { useRef, useState } from "react";
import { getMaxAmountAvailableToBorrow } from "../utils/getMaxAmountAvailableToBorrow";
import { getMaxAmountAvailableToSupply } from "../utils/getMaxAmountAvailableToSupply";
import { ethers } from "ethers";
import { ChainId, InterestRate } from "@aave/contract-helpers";
import { useUser } from "../context/UserContext";
import { getAssetIconUrl } from "../utils/getAssetIconUrl";

export const minBaseTokenRemainingByNetwork: Record<number, string> = {
  [ChainId.optimism]: "0.0001",
  [ChainId.arbitrum_one]: "0.0001",
};

export function StrategyModal({
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
  const { user, assets } = useUser();

  const [step, setStep] = useState(0);  
  // create ref for input deposit, borrow, swap
  const inputDepositRef = useRef<HTMLIonInputElement>(null);
  const inputBorrowRef = useRef<HTMLIonInputElement>(null);
  const inputSwapRef = useRef<HTMLIonInputElement>(null);

  const noticeMessage = (name: string) => `Our strategies leverage and connect to ${name?.toUpperCase()} protocol smart contracts without any third-party involvement, providing a trustless and completely transparent experience.
  Rest assured, our solutions are non-custodial, allowing you to withdraw your assets at any time. Control remains in your hands!`;

  const { userSummaryAndIncentives } = strategy;
  const poolReserveWETH = strategy.step.find(s => s.type === 'borrow' && s.from.toLocaleLowerCase() === 'weth')?.reserve;
  const threshold = Number(userSummaryAndIncentives?.currentLiquidationThreshold||0);
  const userLiquidationThreshold = Number( threshold === 0 
    ? poolReserveWETH?.formattedReserveLiquidationThreshold
    : userSummaryAndIncentives?.currentLiquidationThreshold
  );

  const minBaseTokenRemaining =
          minBaseTokenRemainingByNetwork[
            ethereumProvider?.network?.chainId || 137
          ] || "0.001";
  const { balance: walletBalanceWSTETH = 0 } =
    assets?.find(
      ({ contractAddress, chain = {} }) =>
        contractAddress?.toLocaleLowerCase() ===
        strategy.step.find(s => s.type === 'deposit' && s.from.toLocaleLowerCase() === 'wsteth')?.reserve?.underlyingAsset?.toLocaleLowerCase() &&
        chain?.id === ethereumProvider?.network?.chainId
    ) || {};
  const { balance: walletBalanceWETH = 0 } =
  assets?.find(
    ({ contractAddress, chain = {} }) =>
      contractAddress?.toLocaleLowerCase() ===
      strategy.step.find(s => s.type === 'borrow' && s.from.toLocaleLowerCase() === 'weth')?.reserve?.underlyingAsset?.toLocaleLowerCase() &&
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
          <IonLabel>Strategy Steps <small>({(step + 1) > 4 ? 4 : step + 1}/{4})</small></IonLabel>
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
              if (step === 3) {
                setStep(() => 4);
              } else {
                setStep(() => 1);
              }
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

      {/* Congratulation */}
      {step === 4 && (
        <IonRow class="ion-text-center ion-padding" >
          <IonCol size="12" size-md="10" offset-md="1" size-xl="8" offset-xl="2" class="ion-padding-start ion-padding-end">
          <IonText>
              <h2>Congratulation</h2>
            </IonText>
            <IonText color="medium">
              <p>
                You have successfully completed {strategy.name} strategy.
              </p>
              <p>
                Now you can use your wstETH wallet amount sold to provide liquidity on the {
                strategy.step.find(s => s.type === 'deposit')?.protocol?.toLocaleUpperCase()
                } pool to repeat the process from step 2 and grow you deposit amount to allow you to borrow more WETH to swap  
                and incrase your stakng reward APY till you reach {userLiquidationThreshold*100}% LTV. on {strategy.step.find(s => s.type === 'deposit')?.protocol?.toLocaleUpperCase()}
              </p>
            </IonText>
          </IonCol>

          <IonCol size="12" className="ion-padding-top">
            {/* Event Button */}
            <IonButton className="ion-margin-top" expand="block" onClick={async ()=> {
              if (!ethereumProvider) {
                return;
              }
              setStep(() => 1);
            }}>
              Repeat Strategy
            </IonButton>
          </IonCol>
        </IonRow>
      )}
    </IonGrid>
  )
}