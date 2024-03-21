import Store from "@/store";
import WalletBaseComponent, {
  SelectedTokenDetail,
  WalletComponentProps,
} from "../../components/base/WalletBaseContainer";
import { getWeb3State } from "@/store/selectors";
import { MobileActionNavButtons } from "@/components/mobile/ActionNavButtons";
import { getMagic } from "@/servcies/magic";
import { getAssetIconUrl } from "@/utils/getAssetIconUrl";
import { getReadableValue } from "@/utils/getReadableValue";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  IonSearchbar,
  IonCard,
  IonCardContent,
  IonIcon,
  IonList,
  IonItemSliding,
  IonItem,
  IonAvatar,
  IonLabel,
  IonItemOptions,
  IonItemOption,
  IonAlert,
  IonModal,
  IonButton,
  IonMenuToggle,
  IonRefresher,
  IonRefresherContent,
  RefresherEventDetail,
} from "@ionic/react";
import { card, download, paperPlane, repeat, settings, settingsOutline } from "ionicons/icons";
import { useState } from "react";
import { IAsset } from "@/interfaces/asset.interface";
import { SwapMobileContainer } from "@/containers/mobile/SwapMobileContainer";
import { TokenDetailMobileContainer } from "@/containers/mobile/TokenDetailMobileContainer";
import { EarnMobileContainer } from "@/containers/mobile/EarnMobileContainer";
import { MenuSettings } from "@/components/ui/MenuSetting";
import { currencyFormat } from "@/utils/currencyFormat";

interface WalletMobileComProps {
  isMagicWallet: boolean;
  isSwapModalOpen: SelectedTokenDetail | boolean | undefined;
  setIsSwapModalOpen: (
    value?: SelectedTokenDetail | boolean | undefined
  ) => void;
  isAlertOpen: boolean;
  setIsAlertOpen: (value: boolean) => void;
  isSettingOpen: boolean;
  setIsSettingOpen: (value: boolean) => void;
}

class WalletMobileContainer extends WalletBaseComponent<
  WalletComponentProps & WalletMobileComProps
> {
  constructor(props: WalletComponentProps & WalletMobileComProps) {
    super(props);
  }

  async setIsSwapModalOpen(state?: SelectedTokenDetail | boolean | undefined) {
    this.props.setIsSwapModalOpen(state);
  }

  async setIsSettingOpen(state:  boolean ) {
    this.props.setIsSettingOpen(state);
  }

  async handleDepositClick(state?: boolean | undefined) {
    await super.handleDepositClick(state);
  }

  async handleTokenDetailClick(token?: any): Promise<void> {
    super.handleTokenDetailClick(token);
  }

  async handleEarnClick(): Promise<void> {
    super.handleEarnClick();
  }

  async handleTransferClick(state: boolean): Promise<void> {
    await super.handleTransferClick(state);
  }

  render() {
    return (
      <>
        <IonPage>
          <IonHeader translucent={true}>
            <IonToolbar
              style={{
                "--background": "transparent",
                minHeight: "95px",
                display: "flex",
              }}
            >
              <IonTitle 
                color="dark"
                style={{ fontSize: "1.3rem", padding: "0" }}>
                Wallet
                <small
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    fontWeight: "normal",
                  }}
                >
                  {currencyFormat.format(this.state.totalBalance)}
                </small>
              </IonTitle>

                <IonButton 
                  slot="end"
                  fill="clear"
                  size="small"
                  onClick={()=> this.setIsSettingOpen(true)}>
                    <IonIcon icon={settingsOutline} color="primary" />
                </IonButton>

            </IonToolbar>
          </IonHeader>

          <IonContent
            fullscreen={true}
            className="ion-no-padding"
            style={{ "--padding-top": "0px" }}
          >            
            <IonRefresher 
              slot="fixed" 
              style={{zIndex: '1'}}
              onIonRefresh={async ($event: CustomEvent<RefresherEventDetail>)=> {
              await super.handleRefresh();
              setTimeout(() => {
                // Any calls to load data go here
                $event.detail.complete();
              }, 2000);
            }}>
              <IonRefresherContent color="dark"></IonRefresherContent>
            </IonRefresher>

            <IonHeader collapse="condense">
              <IonToolbar style={{ "--background": "transparent" }}>
                <IonGrid style={{ margin: "2vh auto 1rem", maxWidth: "450px" }}>
                  <IonRow className="ion-align-items-center ion-text-center">
                    <IonCol>
                      <div>
                        <IonText>
                          <h1 style={{ fontSize: "2.618rem" }}>Wallet</h1>
                          <p
                            style={{
                              fontSize: "1.625rem",
                              margin: "0px 0px 1.5rem",
                            }}
                          >
                            {currencyFormat.format(this.state.totalBalance)}
                          </p>
                        </IonText>
                      </div>
                    </IonCol>
                  </IonRow>

                  <MobileActionNavButtons
                    setState={(state: any) => this.setState(state)}
                    setIsSwapModalOpen={() =>
                      this.setIsSwapModalOpen(true)
                    }
                  />

                  {this.state.assetGroup.length > 0 && (
                    <IonRow className="ion-padding-top">
                      <IonCol size="12">
                        <div>
                          <IonSearchbar
                            debounce={500}
                            onIonInput={(event) => {
                              this.handleSearchChange(event);
                            }}
                          ></IonSearchbar>
                        </div>
                      </IonCol>
                    </IonRow>
                  )}
                </IonGrid>
              </IonToolbar>
            </IonHeader>


            <IonGrid
              className="ion-no-padding"
              style={{
                background: "var(--ion-background-color)",
                minHeight: "100%",
              }}
            >
              {this.state.totalBalance <= 0 && (
                <IonRow className="ion-padding-vertical">
                  <IonCol size="12">
                    <IonCard onClick={()=> super.handleBuyWithFiat(true)}>
                      <IonCardContent>
                        <IonGrid>
                          <IonRow className="ion-align-items-center">
                            <IonCol size="auto" className="ion-padding-end">
                              <IonIcon size="large" icon={card} color="dark" />
                            </IonCol>
                            <IonCol>
                              <IonText color="dark">
                                <h2>
                                  <b>
                                    Buy crypto
                                  </b>
                                </h2>
                                <p>
                                  You have to get ETH to use your wallet. Buy
                                  with credit card or with Apple Pay
                                </p>
                              </IonText>
                              <IonButton size="small" className="ion-margin-top">
                                Buy crypto
                              </IonButton>
                            </IonCol>
                          </IonRow>
                        </IonGrid>
                      </IonCardContent>
                    </IonCard>

                    <IonCard
                      className="ion-margin-top"
                      onClick={() => this.handleDepositClick()}
                    >
                      <IonCardContent>
                        <IonGrid>
                          <IonRow className="ion-align-items-center">
                            <IonCol size="auto" className="ion-padding-end">
                              <IonIcon size="large" icon={download} color="dark" />
                            </IonCol>
                            <IonCol>
                              <IonText color="dark">
                                <h2>
                                  <b>
                                    Deposit assets
                                  </b>
                                </h2>
                                <p>
                                  Transefer tokens from another wallet or from a crypto exchange
                                </p>
                              </IonText>
                              <IonButton size="small" className="ion-margin-top">
                                Deposit assets
                              </IonButton>
                            </IonCol>
                          </IonRow>
                        </IonGrid>
                      </IonCardContent>
                    </IonCard>
                  </IonCol>
                </IonRow>
              )}

              {this.state.totalBalance > 0 && (
                <IonRow
                  className="ion-no-padding"
                  style={{ maxWidth: "950px", margin: "auto" }}
                >
                  <IonCol size="12" className="ion-no-padding">
                    <IonList
                      style={{ background: "transparent" }}
                      className="ion-no-padding"
                    >
                      {this.state.assetGroup
                        .filter((asset) =>
                          this.state.filterBy
                            ? asset.symbol
                                .toLowerCase()
                                .includes(this.state.filterBy.toLowerCase())
                            : true
                        )
                        .sort((a, b) => (a.balanceUsd > b.balanceUsd ? -1 : 1))
                        .map((asset, index) => (
                          <IonItemSliding key={index}>
                            <IonItem
                              style={{
                                "--background": "var(--ion-background-color)",
                              }}
                              onClick={() => {
                                console.log("handleTokenDetailClick: ", asset);
                                this.handleTokenDetailClick(asset);
                              }}
                            >
                              <IonAvatar
                                slot="start"
                                style={{
                                  overflow: "hidden",
                                  width: "42px",
                                  height: "42px",
                                }}
                              >
                                <img
                                  src={asset.symbol === 'ETH'
                                  ? getAssetIconUrl({
                                      symbol: asset.symbol,
                                    })
                                  : asset.thumbnail||getAssetIconUrl({
                                      symbol: asset.symbol,
                                    })}
                                  alt={asset.symbol}
                                  style={{ transform: "scale(1.01)" }}
                                  onError={(event) => {
                                    (
                                      event.target as any
                                    ).src = `https://images.placeholders.dev/?width=42&height=42&text=${asset.symbol}&bgColor=%23000000&textColor=%23182449`;
                                  }}
                                />
                              </IonAvatar>
                              <IonLabel className="">
                                <IonText>
                                  <h2 className="ion-no-margin">
                                    {asset.symbol}
                                  </h2>
                                </IonText>
                                <IonText color="medium">
                                  <p className="ion-no-margin">
                                    <small>{asset.name}</small>
                                  </p>
                                </IonText>
                              </IonLabel>
                              <IonText slot="end" className="ion-text-end">
                                <p>
                                  {currencyFormat.format(asset.balanceUsd)}
                                  <br />
                                  <IonText color="medium">
                                    <small>{asset.balance.toFixed(6)}</small>
                                  </IonText>
                                </p>
                              </IonText>
                            </IonItem>
                            <IonItemOptions
                              side="end"
                              onClick={(event) => {
                                // close the sliding item after clicking the option
                                (event.target as HTMLElement)
                                  .closest("ion-item-sliding")
                                  ?.close();
                              }}
                            >
                              <IonItemOption
                                color="primary"
                                onClick={() => {
                                  this.handleTransferClick(true);
                                }}
                              >
                                <IonIcon
                                  slot="icon-only"
                                  size="small"
                                  icon={paperPlane}
                                ></IonIcon>
                              </IonItemOption>
                              <IonItemOption
                                color="primary"
                                onClick={() => {
                                  this.setIsSwapModalOpen(asset);
                                }}
                              >
                                <IonIcon
                                  slot="icon-only"
                                  size="small"
                                  icon={repeat}
                                ></IonIcon>
                              </IonItemOption>
                            </IonItemOptions>
                          </IonItemSliding>
                        ))}
                    </IonList>
                  </IonCol>
                </IonRow>
              )}
              
              <IonRow>
                <IonCol size="12" className="ion-text-center ion-margin-top ion-padding">
                  <IonText color="medium">
                    <p style={{ fontSize: "0.6rem" }}>
                      You are using a non-custodial wallet that give you complete
                      control over your cryptocurrency funds and private keys.
                      Unlike custodial wallets, you manage your own security,
                      enhancing privacy and independence in the decentralized
                      cryptocurrency space.
                    </p>
                  </IonText>
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonContent>
        </IonPage>

        <IonModal
          isOpen={this.state.isEarnModalOpen}
          breakpoints={this.props.modalOpts.breakpoints}
          initialBreakpoint={this.props.modalOpts.initialBreakpoint}
          onDidDismiss={() => this.setState({ isEarnModalOpen: false })}
        >
          <EarnMobileContainer dismiss={async ()=> this.setState({ isEarnModalOpen: false })} />
        </IonModal>

        <IonModal
          isOpen={Boolean(this.props.isSwapModalOpen)}
          breakpoints={this.props.modalOpts.breakpoints}
          initialBreakpoint={this.props.modalOpts.initialBreakpoint}
          onDidDismiss={() => {
            this.setIsSwapModalOpen(undefined);
          }}
        >
          <SwapMobileContainer
            dismiss={() => this.props.setIsSwapModalOpen(false)}
            token={
              typeof this.props.isSwapModalOpen !== "boolean"
                ? this.props.isSwapModalOpen
                : undefined
            }
          />
        </IonModal>

        <IonModal
          isOpen={Boolean(this.state.selectedTokenDetail)}
          breakpoints={this.props.modalOpts.breakpoints}
          initialBreakpoint={this.props.modalOpts.initialBreakpoint}
          onDidDismiss={() => this.handleTokenDetailClick(null)}
        >
          {this.state.selectedTokenDetail && (
            <TokenDetailMobileContainer
              setState={(state: any) => this.setState(state)}
              setIsSwapModalOpen={() => this.setIsSwapModalOpen(true)}
              data={this.state.selectedTokenDetail}
              dismiss={() => this.handleTokenDetailClick(null)}
            />
          )}
        </IonModal>

        <IonModal
          isOpen={this.props.isSettingOpen}
          breakpoints={this.props.modalOpts.breakpoints}
          initialBreakpoint={this.props.modalOpts.initialBreakpoint}
          onDidDismiss={() => this.setIsSettingOpen(false)}
        >
          <MenuSettings dismiss={()=> this.setIsSettingOpen(false)} />
        </IonModal>

        {super.render()}
      </>
    );
  }
}

const withStore = (
  Component: React.ComponentClass<WalletComponentProps & WalletMobileComProps>
) => {
  // use named function to prevent re-rendering failure
  return function WalletMobileContainerWithStore() {
    const { walletAddress, assets, isMagicWallet, loadAssets } =
      Store.useState(getWeb3State);
    const [isSettingOpen, setIsSettingOpen] = useState(false);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [isSwapModalOpen, setIsSwapModalOpen] = useState<
      SelectedTokenDetail | boolean | undefined
    >(undefined);

    return (
      <Component
        isMagicWallet={isMagicWallet}
        walletAddress={walletAddress}
        assets={assets}
        isAlertOpen={isAlertOpen}
        setIsAlertOpen={setIsAlertOpen}
        isSwapModalOpen={isSwapModalOpen}
        setIsSwapModalOpen={(value) => setIsSwapModalOpen(value)}
        isSettingOpen={isSettingOpen}
        setIsSettingOpen={setIsSettingOpen}
        modalOpts={{
          initialBreakpoint: 1,
          breakpoints: [0, 1],
        }}
        loadAssets={(force?: boolean)=> loadAssets(force)}
      />
    );
  };
};
export default withStore(WalletMobileContainer);
