import {
  IonButton,
  IonChip,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonPopover,
  IonText,
} from "@ionic/react";
import { CHAIN_AVAILABLES, CHAIN_DEFAULT } from "../constants/chains";
import { useWeb3Provider } from "../context/Web3Context";
import { useRef } from "react";
import { RPC_NODE_OPTIONS, getRPCNodeOptions } from "../servcies/magic";

const getAvailableChains = (withTestnet?: boolean) =>
  CHAIN_AVAILABLES.filter((chain) =>
    Boolean(RPC_NODE_OPTIONS.find((rpc) => rpc.chainId === chain.id))
  )
    .filter((chain) => (withTestnet ? true : !chain.testnet))
    // sort `CHAIN_DEFAULT` to the first position then the rest of the array is sorted by `alphabetical order`
    .sort((a, b) =>
      a.id === CHAIN_DEFAULT.id ? -1 : a.name.localeCompare(b.name)
    );

function NetworkPopover({
  handleSwitchNetwork,
  popoverRef,
  currentChainId,
}: {
  handleSwitchNetwork?: (chainId: number) => Promise<void>;
  popoverRef: React.RefObject<HTMLIonPopoverElement>;
  currentChainId: number;
}) {
  return (
    <>
      <IonPopover
        ref={popoverRef}
        trigger="click-trigger-networkpopover"
        triggerAction="click"
      >
        <IonContent class="ion-no-padding">
          <IonListHeader className="ion-margin-bottom">
            <IonLabel>
              <IonText>
                <h2>Network</h2>
              </IonText>
              <IonText color="medium">
                <p style={{ fontWeight: "normal", fontSize: "60%" }}>
                  Choose a network
                </p>
              </IonText>
            </IonLabel>
          </IonListHeader>
          <IonList
            lines="none"
            className="ion-padding-bottom"
            style={{ background: "transparent" }}
          >
            {getAvailableChains().map((chain, index) => (
              <IonItem
                detail={false}
                button={true}
                key={index}
                onClick={async () => {
                  console.log("{{NetworkPopover}} chain", chain);
                  handleSwitchNetwork && (await handleSwitchNetwork(chain.id));
                  popoverRef.current?.dismiss();
                }}
                className={chain.id === currentChainId ? " selected " : ""}
              >
                <IonIcon slot="start" src={chain.logo}></IonIcon>
                <span>
                  {chain.name}{" "}
                  {index === 0 && (
                    <IonChip
                      color="primary"
                      style={{
                        transform: "scale(0.7)",
                      }}
                    >
                      default
                    </IonChip>
                  )}
                </span>
              </IonItem>
            ))}
          </IonList>
        </IonContent>
      </IonPopover>
    </>
  );
}

export function NetworkButton() {
  const { web3Provider, currentNetwork } = useWeb3Provider();
  const popoverRef = useRef<HTMLIonPopoverElement>(null);

  const getChainData = (chainId: number) => {
    const chain = getAvailableChains().find((chain) => chain.id === chainId);
    console.log("{{NetworkButton}} getChainData(): ", { chainId, chain });
    return chain;
  };

  const chain = getChainData(
    currentNetwork || CHAIN_DEFAULT.id
  );
  const handleSwitchNetwork = async (chainId: number) => {
    const isMagic = (web3Provider as any)?.provider?.sdk?.rpcProvider
      ?.isMagic;
    console.log(
      "{{NetworkButton}} handleSwitchNetwork(): web3Provider",
      isMagic,
      Number(BigInt(chainId).toString())
    );
    // save the new chainId to localstorage
    localStorage.setItem(
      "default-chainId",
      `${Number(BigInt(chainId).toString())}`
    );
    try {
      throw new Error("Not implemented");
      // if (!isMagic) {
      //   // convert decimal to hexa
      //   const hexaChainId = `0x${Number(BigInt(chainId).toString()).toString(
      //     16
      //   )}`;
      //   await web3Provider?.provider.request?.({
      //     method: "wallet_switchEthereumChain",
      //     params: [{ chainId: hexaChainId }],
      //   });
      // } else {
      //   await initializeWeb3();
      // }
      // save the new chainId to localstorage
    } catch (error: any) {
      console.log("{{NetworkButton}} handleSwitchNetwork(): error", error);
      throw error;
      // This error code indicates that the chain has not been added to MetaMask.
      // if (error.code === 4902 && chain) {
      //   try {
      //     await web3Provider?.provider.request?.({
      //       method: "wallet_addEthereumChain",
      //       params: [
      //         {
      //           chainId: "0x" + Number(BigInt(chainId).toString()),
      //           chainName: chain.name,
      //           nativeCurrency: {
      //             name: chain.nativeSymbol,
      //             symbol: chain.nativeSymbol,
      //             decimals: 18,
      //           },
      //           rpcUrls: [(await getRPCNodeOptions()).rpcUrl],
      //         },
      //       ],
      //     });
      //   } catch (addError) {
      //     console.log(
      //       "{{NetworkButton}} handleSwitchNetwork(): addError",
      //       addError
      //     );
      //     // handle "add" error
      //   }
      // }
    }
  };
  return !chain ? (
    <></>
  ) : (
    <>
      <IonButton
        id="click-trigger-networkpopover"
        fill="clear"
        className="ion-hide-lg-down"
      >
        <IonIcon src={chain.logo}></IonIcon>
      </IonButton>
      <NetworkPopover
        popoverRef={popoverRef}
        currentChainId={chain.id}
        handleSwitchNetwork={handleSwitchNetwork}
      />
    </>
  );
}
