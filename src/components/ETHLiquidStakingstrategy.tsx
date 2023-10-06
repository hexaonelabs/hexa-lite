import {
  IonButton,
  IonCard,
  IonCol,
  IonGrid,
  IonIcon,
  IonImg,
  IonItem,
  IonLabel,
  IonModal,
  IonRow,
  IonSkeletonText,
  IonSpinner,
  IonText,
  useIonToast,
} from "@ionic/react";
import {
  informationCircleOutline,
  closeSharp,
  openOutline,
  warningOutline,
  helpOutline,
} from "ionicons/icons";
import { useUser } from "../context/UserContext";
import ConnectButton from "./ConnectButton";
import { useEffect, useRef, useState } from "react";
import { getAssetIconUrl } from "../utils/getAssetIconUrl";
import { getBaseAPRstETH, getETHByWstETH } from "../servcies/lido.service";
import { OverlayEventDetail } from "@ionic/react/dist/types/components/react-component-lib/interfaces";
import { useEthersProvider } from "../context/Web3Context";
import { useLoader } from "../context/LoaderContext";
import { CHAIN_AVAILABLES, CHAIN_DEFAULT } from "../constants/chains";
import { AssetInput } from "./AssetInput";
import { ethers } from "ethers";
import { swapWithLiFi } from "../servcies/lifi.service";
import { HowItWork } from "./HowItWork";
import { ApyDetail } from "./ApyDetail";

export interface IStrategyModalProps {
  dismiss?: (
    data?: any,
    role?: string | undefined
  ) => Promise<boolean> | undefined;
}

const handleSwap = async (
  provider: ethers.providers.Web3Provider,
  amount: number,
  balanceWETH: number,
  toToken: { decimals: number; address: string },
  fromToken: { decimals: number; address: string }
) => {
  if (!provider) {
    return {};
  }
  // verify max amount
  if (amount > balanceWETH) {
    console.error({
      message: `{{handleSwap}} Invalid amount: ${amount}. Value must be less or equal than your balance.`,
    });
    return {};
  }
  // handle invalid amount
  if (isNaN(amount) || amount <= 0) {
    throw new Error(
      "{{handleSwap}} Invalid amount. Value must be greater than 0."
    );
  }
  // convert decimal amount to bigNumber string using token decimals
  const amountInWei = ethers.utils
    .parseUnits(amount.toString(), toToken?.decimals || 18)
    .toString();
  // call method
  const fromAddress = await provider?.getSigner().getAddress();
  const params = {
    fromAddress,
    fromAmount: amountInWei,
    fromChain: provider.network.chainId.toString(),
    fromToken: fromToken.address,
    toChain: provider.network.chainId.toString(),
    toToken: toToken.address,
  };
  console.log("{{handleSwap}} params: ", { params });
  const receipt = await swapWithLiFi(params, provider);
  console.log("{{handleSwap}} TX result: ", receipt);
  return { txReceipts: [receipt] };
};

export function EthLiquidStakingStrategyModal({
  dismiss,
}: IStrategyModalProps) {
  const { ethereumProvider, switchNetwork } = useEthersProvider();
  const { user, assets, refresh: refreshUser } = useUser();
  const { display: displayLoader, hide: hideLoader } = useLoader();

  const [successState, setSuccessState] = useState(false);
  const [wstToEthAmount, setWstToEthAmount] = useState(-1);
  const [inputSwapValue, setInputSwapValue] = useState(0);

  const toastContext = useIonToast();
  const presentToast = toastContext[0];
  const dismissToast = toastContext[1];

  const walletBalanceWETH =
    assets?.find(
      (a) =>
        a.symbol === "WETH" &&
        a.chain?.id === (ethereumProvider?.network?.chainId || CHAIN_DEFAULT.id)
    )?.balance || 0;

  useEffect(() => {
    if (!ethereumProvider) {
      return;
    }
    getETHByWstETH(1).then((value) => {
      setWstToEthAmount(() => Number(value));
    });
  }, [ethereumProvider]);

  useEffect(() => {
    setInputSwapValue(() => 0);
  }, [successState]);

  return (
    <IonGrid>
      <IonRow
        class="ion-text-center ion-padding-top ion-padding-horizontal"
        style={{ position: "relative" }}
      >
        {dismiss && (
          <IonCol
            size="12"
            class="ion-text-end"
            style={{ marginBottom: "-2rem" }}
          >
            <IonButton
              size="small"
              fill="clear"
              style={{
                zIndex: "1",
                position: "absolute",
                right: 0,
                top: 0,
              }}
              onClick={async () => {
                dismiss(null, "cancel");
              }}
            >
              <IonIcon slot="icon-only" icon={closeSharp}></IonIcon>
            </IonButton>
          </IonCol>
        )}
      </IonRow>

      <IonRow class="ion-text-center ion-padding-horizontal ion-padding-bottom">
        <IonCol
          size="12"
          class="ion-padding-start ion-padding-end ion-padding-bottom"
        >
          <IonText>
            <h2>Swap</h2>
          </IonText>
          <IonText color="medium">
            <p>
              By swapping WETH to wstETH you will incrase your WETH holdings
              revard from staking WETH on Lido.
            </p>
          </IonText>
        </IonCol>
        <IonCol
          size-xs="12"
          size-md="6"
          class="ion-padding-horizontal ion-text-start"
        >
          <AssetInput
            symbol={"WETH"}
            balance={inputSwapValue}
            maxBalance={walletBalanceWETH?.toString()}
            textBalance={"Balance"}
            onChange={(value) => {
              const amount = Number(value);
              setInputSwapValue(() => amount);
            }}
          />
        </IonCol>
        <IonCol
          size-xs="12"
          size-md="6"
          class="ion-padding-horizontal ion-text-end"
        >
          <AssetInput
            disabled={true}
            symbol={"wstETH"}
            value={
              (inputSwapValue || 0) * wstToEthAmount > 0
                ? +((inputSwapValue || 0) * wstToEthAmount).toFixed(4)
                : 0
            }
          />
        </IonCol>
        <IonCol size="12" class="ion-padding-horizontal ion-padding-bottom">
          <IonText color="primary">
            <p style={{ margin: "0 0 1rem" }}>
              <small>
                {`1 WETH = ~${
                  wstToEthAmount > 0 ? wstToEthAmount.toFixed(4) : 0
                } wstETH`}
              </small>
            </p>
          </IonText>
          {/* <IonText color="medium">
            <small>{noticeMessage("AAVE")}</small>
          </IonText> */}
        </IonCol>
        <IonCol size="12" className="ion-padding-top">
          <IonButton
            className="ion-margin-top"
            expand="block"
            color="gradient"
            onClick={async () => {
              await displayLoader();
              try {
                const { txReceipts } = await handleSwap(
                  ethereumProvider as ethers.providers.Web3Provider,
                  Number(inputSwapValue || -1),
                  walletBalanceWETH || 0,
                  {
                    decimals: 18,
                    address: "0x1f32b1c2345538c0c6f582fcb022739c4a194ebb",
                  },
                  {
                    decimals: 18,
                    address: "0x4200000000000000000000000000000000000006",
                  }
                );
                await refreshUser();
                if ((txReceipts?.length || 0) > 0) {
                  await presentToast({
                    message: `Swap completed successfully`,
                    duration: 5000,
                    color: "success",
                  });
                  setSuccessState(() => true);
                }
              } catch (error: any) {
                console.log("handleSwap:", { error });
                await presentToast({
                  message: `[ERROR] Exchange Failed with reason: ${
                    error?.message || error
                  }`,
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
              }
              await hideLoader();
            }}
          >
            Swap
          </IonButton>
        </IonCol>
      </IonRow>

      {/* Congratulation */}
      {successState === true && (
        <IonRow class="ion-text-center ion-padding-horizontal ion-padding-bottom">
          <IonCol
            size="12"
            class="ion-padding-start ion-padding-end ion-padding-bottom"
          >
            <IonText>
              <h2>Congratulation</h2>
            </IonText>
            <IonText color="medium">
              <p>You have successfully swap yout token.</p>
              <p>Now you earn revard from staking WETH on Lido.</p>
            </IonText>
          </IonCol>

          <IonCol size="12" className="ion-padding-top">
            {/* Event Button */}
            <IonButton
              className="ion-margin-top"
              expand="block"
              color="gradient"
              onClick={async () => {
                if (!ethereumProvider) {
                  return;
                }
                setSuccessState(() => false);
              }}
            >
              Done
            </IonButton>
          </IonCol>
        </IonRow>
      )}
    </IonGrid>
  );
}

export function ETHLiquidStakingstrategyCard() {
  const { user } = useUser();
  const { ethereumProvider, switchNetwork } = useEthersProvider();
  const [baseAPRstETH, setBaseAPRstETH] = useState(-1);

  const strategy = {
    name: "ETH Liquid",
    type: "staking",
    icon: getAssetIconUrl({ symbol: "ETH" }),
    apys: [baseAPRstETH.toFixed(2)],
    locktime: 0,
    providers: ["lido"],
    assets: ["WETH", "wstETH"],
    isStable: true,
    chainsId: [10],
    details: {
      description: `
        This strategy will swap your ETH for wstETH to earn ${baseAPRstETH.toFixed(
          2
        )}% APY revard from staking WETH on Lido.
      `,
    },
  };
  const modal = useRef<HTMLIonModalElement>(null);

  useEffect(() => {
    const { signal, abort } = new AbortController();
    getBaseAPRstETH().then(({ apr }) => setBaseAPRstETH(() => apr));
    // return () => abort();
  }, []);

  // UI Component utils
  const Loader = <IonSpinner name="dots" />;
  const CardButton = !user ? (
    <ConnectButton expand="block" />
  ) : (
    <IonButton
      onClick={async () => {
        // check correct chain
        const chainId = ethereumProvider?.network?.chainId;
        if (chainId !== 10) {
          await switchNetwork(10);
        } 
        modal.current?.present();
      }}
      expand="block"
      color="gradient"
    >
      Start Earning
    </IonButton>
  );

  return (
    <>
      <IonCard className="strategyCard" style={{ width: 330 }}>
        <IonGrid style={{width: '100%'}}>
          <IonRow class="ion-text-center ion-padding">
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
                <IonText className="ion-color-gradient-text">{strategy.name}</IonText>
                <br />
                <small>{strategy.type}</small>
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
                style={{
                  "--background": "transparent",
                  "--inner-padding-end": "none",
                  "--padding-start": "none",
                }}
              >
              <IonLabel>Network</IonLabel>
                <div slot="end" style={{ display: "flex" }}>
                  {strategy.chainsId
                    .map((id) => CHAIN_AVAILABLES.find((c) => c.id === id))
                    .map((c,index) => {
                      if (!c||!c.nativeSymbol) return null;
                      return (
                        <IonImg
                        key={index}
                        style={{
                          width: 18,
                          height: 18,
                          transform: (index === 0 && strategy.chainsId.length > 1)  ? "translateX(5px)" : "none",
                        }}
                        src={getAssetIconUrl({ symbol: c.nativeSymbol })}
                        alt={c.nativeSymbol}
                      />)
                    })}
                </div>
              </IonItem>
              <IonItem
                style={{
                  "--background": "transparent",
                  "--inner-padding-end": "none",
                  "--padding-start": "none",
                }}
              >
                <IonLabel>
                  APY
                  <ApyDetail>
                    <>
                      <IonItem>
                        <IonLabel color="medium">
                          <h2>
                            Base APY <small>(stETH)</small>
                          </h2>
                        </IonLabel>
                        <IonText slot="end">{strategy.apys[0]}%</IonText>
                      </IonItem>
                      <IonItem lines="none">
                        <IonLabel>
                          <h2>
                            <b>Total variable APY</b>
                          </h2>
                        </IonLabel>
                        <IonText slot="end">
                          <b>{strategy.apys[0]}%</b>
                        </IonText>
                      </IonItem>
                    </>
                  </ApyDetail>
                </IonLabel>
                <div slot="end" style={{ display: "flex" }}>
                  {strategy.apys.map((apy, index) => (
                    <IonText key={index}>{apy}%</IonText>
                  ))}
                </div>
              </IonItem>
              <IonItem
                style={{
                  "--background": "transparent",
                  "--inner-padding-end": "none",
                  "--padding-start": "none",
                }}
              >
                <IonLabel>Protocols</IonLabel>
                <div slot="end" style={{ display: "flex" }}>
                  {strategy.providers
                    .map((p, index) => p.toLocaleUpperCase())
                    .join(" + ")}
                </div>
              </IonItem>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol size="12" class="ion-padding-horizontal ion-padding-bottom">
              <HowItWork>
                <IonText>
                  <h4>Staking WETH with Lido</h4>
                  <p className="ion-no-margin ion-margin-bottom">
                    <small>
                      By swapping WETH to wstETH you will incrase your WETH
                      holdings by {baseAPRstETH.toFixed(2)}% APY revard from staking WETH
                      using{" "}
                      <a
                        href="https://lido.fi/"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Lido
                      </a>
                      .
                    </small>
                  </p>
                </IonText>
              </HowItWork>
              {CardButton}
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
          "--height": "auto",
          "--max-height": "90vh",
          "--border-radius": "32px",
        }}
      >
        <EthLiquidStakingStrategyModal
          dismiss={(data?: any, role?: string | undefined) =>
            modal.current?.dismiss(data, role)
          }
        />
      </IonModal>
    </>
  );
}
