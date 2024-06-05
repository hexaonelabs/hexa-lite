import { card, download, eyeOffOutline, eyeOutline, image, list, paperPlane, time } from "ionicons/icons";
import WalletBaseComponent, {
  WalletComponentProps,
} from "../../components/base/WalletBaseContainer";
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCol,
  IonGrid,
  IonIcon,
  IonLabel,
  IonModal,
  IonRow,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonText,
} from "@ionic/react";
import ConnectButton from "@/components/ConnectButton";
import Store from "@/store";
import { getAppSettings, getWeb3State } from "@/store/selectors";
import { TokenDetailDesktopContainer } from "./TokenDetailDesktopContainer";
import { currencyFormat } from "@/utils/currencyFormat";
import { WalletAssetEntity } from "@/components/ui/WalletAssetEntity";
import { Currency } from "@/components/ui/Currency";
import { patchAppSettings } from "@/store/actions";
import { ToggleHideCurrencyAmount } from "@/components/ui/ToggleHideCurrencyAmount";
import { WalletTxEntity } from "@/components/ui/WalletTxEntity";
import { TxsList } from "@/components/ui/TsxList/TxsList";

class WalletDesktopContainer extends WalletBaseComponent<WalletComponentProps> {
  constructor(props: WalletComponentProps) {
    super(props);
  }

  render() {

    return (
      <>
        {super.render()}
        <IonGrid
          class="ion-padding"
          style={{
            marginBottom: "5rem",
            maxWidth: "1224px",
            paddingTop: "3rem",
          }}
        >
          <IonRow
            style={{ marginBottom: "2rem" }}
            class="ion-justify-content-center ion-align-items-center"
          >
            <IonCol size="6" class="ion-text-start">
              <IonText>
                <h1 style={{ marginTop: 0, fontSize: "2.2rem", display: 'flex', alignItems: 'center' }}>
                  Wallet
                  <ToggleHideCurrencyAmount />
                </h1>
              </IonText>
              <IonText>
                <p className="ion-no-margin" style={{ fontSize: "1.6rem" }}>
                  <Currency value={this.state.totalBalance} />
                </p>
              </IonText>
            </IonCol>
            <IonCol size="6" class="ion-text-end">
              {/* send btn + Deposit btn */}
              <IonButton
                color="dark"
                fill="clear"
                disabled={this.state.assetGroup.length === 0}
                onClick={() => {
                  this.handleTransferClick(true);
                }}
              >
                <IonIcon color="dark" icon={paperPlane} slot="start" />
                <IonText color="dark">Send</IonText>
              </IonButton>
              <IonButton
                color="dark"
                fill="clear"
                disabled={!Boolean(this.props.walletAddress)}
                onClick={() => {
                  this.handleDepositClick();
                }}
              >
                <IonIcon color="dark" icon={download} slot="start" />
                <IonText color="dark">Deposit</IonText>
              </IonButton>
            </IonCol>
          </IonRow>

          {!this.props.walletAddress && (
            <IonRow
              className=" ion-padding"
              style={{
                borderTop: "solid 1px rgba(var(--ion-color-primary-rgb), 0.2)",
              }}
            >
              <IonCol size="12" class="ion-text-center">
                <IonText>
                  <p>
                    Connecting your wallet is key to accessing a snapshot of
                    your assets. <br />
                    It grants you direct insight into your holdings and
                    balances.
                  </p>
                </IonText>
              </IonCol>
              <IonCol size="12" class="ion-text-center">
                <ConnectButton />
              </IonCol>
            </IonRow>
          )}

          {this.props.walletAddress && this.state.assetGroup.length === 0 && (
            <IonRow
              className="ion-no-padding"
              style={{
                borderTop: "solid 1px rgba(var(--ion-color-primary-rgb), 0.2)",
                paddingTop: "2rem",
              }}
            >
              <IonCol
                size-xs="12"
                size-sm="12"
                size-md="6"
                size-lg="6"
                size-xl="6"
                className="ion-text-center"
              >
                <IonCard
                  style={{ cursor: "pointer" }}
                  className="ion-no-margin no-shadow"
                  onClick={() => {
                    super.handleBuyWithFiat(true);
                  }}
                >
                  <IonCardContent>
                    <IonGrid>
                      <IonRow className="ion-align-items-center">
                        <IonCol size="auto" class="ion-text-center">
                          <IonIcon icon={card} size="large" color="dark" />
                        </IonCol>
                        <IonCol class="ion-text-start ion-padding">
                          <IonText color="dark">
                            <h2>
                              <b>
                                Buy crypto
                              </b>
                            </h2>
                            <p>
                              You have to get ETH to use your wallet. Buy with
                              credit card or with Apple Pay
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
              </IonCol>
              <IonCol
                size-xs="12"
                size-sm="12"
                size-md="6"
                size-lg="6"
                size-xl="6"
                className="ion-text-center"
              >
                <IonCard
                  style={{ cursor: "pointer" }}
                  className="ion-no-margin no-shadow"
                  onClick={() => {
                    super.handleDepositClick()
                  }}
                >
                  <IonCardContent>
                    <IonGrid>
                      <IonRow className="ion-align-items-center">
                        <IonCol size="auto" class="ion-text-center">
                          <IonIcon icon={download} size="large" color="dark" />
                        </IonCol>
                        <IonCol class="ion-text-start ion-padding">
                          <IonText color="dark">
                            <h2>
                              <b>
                                Deposit assets
                              </b>
                            </h2>
                            <p>
                              Transfer tokens from another wallet or from a
                              crypto exchange
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
              <IonCol size="12" className="ion-text-center ion-padding">
                <IonText color="medium">
                  <p style={{ fontSize: "0.8rem" }}>
                    You are using a non-custodial wallet that give you complete
                    control over your cryptocurrency funds and private keys.
                    Unlike custodial wallets, you manage your own security,
                    enhancing privacy and independence in the decentralized
                    cryptocurrency space.
                  </p>
                </IonText>
              </IonCol>
            </IonRow>
          )}

          {/* wrapper to display card with assets items */}
          {this.state.assetGroup.length > 0 && (
            <>
              <IonRow style={{ marginTop: "3rem" }} className="ion-align-items-center ion-justify-content-between">
                <IonCol>
                  <IonSearchbar
                    placeholder="Search by symbol"
                    style={{maxWidth: '300px'}}
                    className="ion-no-padding"
                    onIonInput={(e) => {
                      this.handleSearchChange(e);
                    }}
                  />
                </IonCol>
                <IonCol size="auto" className="ion-no-padding">
                  <div className="wallet__switch_current_view">
                    <IonButton 
                      disabled={this.state.currentView === 'tokens'} 
                      size="small"
                      onClick={()=> this.setState(state => ({
                        ...state,
                        currentView: 'tokens'
                      }))}>
                      <IonIcon size="small" icon={list} />
                    </IonButton>
                    <IonButton 
                      disabled={this.state.currentView === 'txs'} 
                      size="small"
                      onClick={()=> this.setState(state => ({
                        ...state,
                        currentView: 'txs'
                      }))}>
                      <IonIcon size="small" src="./assets/icons/history-icon.svg" />
                    </IonButton>
                    {/* <IonButton disabled={this.state.currentView === 'nfts'} size="small">
                      <IonIcon color="dark" icon={image} />
                    </IonButton> */}
                  </div>
                </IonCol>
              </IonRow>
              <IonRow class="widgetWrapper" style={{ marginTop: "0.5rem" }}>
                {/* tokens view */}
                {this.state.currentView === 'tokens' && (
                  <IonCol size="12" class="ion-no-padding">
                    <IonGrid
                      class="ion-padding"
                      style={{
                        borderBottom:
                          "solid 1px rgba(var(--ion-color-primary-rgb), 0.2)",
                      }}
                    >
                      <IonRow className="ion-align-items-center ion-justify-content-between">
                        <IonCol
                          size="6"
                        >
                          <IonLabel color="medium" className="ion-no-padding">
                            <small>
                              Asset
                            </small>
                          </IonLabel>
                        </IonCol>
                        <IonCol
                          size="6"
                          className="ion-text-end"
                        >
                          <IonGrid className="ion-no-padding">
                            <IonRow className="ion-text-end">
                              <IonCol
                                size-md="4"
                                size-lg="4"
                                size-xl="4"
                                className="ion-hide-md-down ion-padding-horizontal"
                              >
                                <IonText color="medium">
                                  <small>Price</small>
                                </IonText>
                              </IonCol>
                              <IonCol
                                size-md="4"
                                size-lg="4"
                                size-xl="4"
                                className="ion-hide-md-down ion-padding-horizontal"
                              >
                                <IonText color="medium">
                                  <small>Balance</small>
                                </IonText>
                              </IonCol>
                              <IonCol
                                size-xs="12"
                                size-sm="12"
                                size-md="4"
                                size-lg="4"
                                size-xl="4"
                                className="ion-padding-horizontal"
                              >
                                <IonText color="medium">
                                  <small>Value</small>
                                </IonText>
                              </IonCol>
                            </IonRow>
                          </IonGrid>
                        </IonCol>
                      </IonRow>
                    </IonGrid>
                    {this.state.assetGroup
                      .filter((asset) =>
                        this.state.filterBy
                          ? asset.symbol
                              .toLowerCase()
                              .includes(this.state.filterBy.toLowerCase())
                          : true
                      )
                      .map((asset, index) => {
                        return (
                          <WalletAssetEntity
                            setSelectedTokenDetail={(asset) =>
                              this.handleTokenDetailClick(asset)
                            }
                            asset={asset}
                            key={index}
                          />
                        );
                      })}

                      {(this.state.assetGroup.filter((asset) =>
                        this.state.filterBy
                          ? asset.symbol
                              .toLowerCase()
                              .includes(this.state.filterBy.toLowerCase())
                          : true
                      ).length === 0) && (
                        <p className="ion-padding ion-text-center">Assets not found in your wallet</p>
                      )}
                  </IonCol>
                )}
                {/* txs view */}
                {this.state.currentView === 'txs' && (
                  <IonCol size="12" class="ion-no-padding" >
                    <TxsList filterBy={this.state.filterBy} />
                  </IonCol>
                )}
              </IonRow>
            </>
          )}
        </IonGrid>

        <IonModal
          isOpen={Boolean(this.state.selectedTokenDetail)}
          breakpoints={this.props.modalOpts.breakpoints}
          initialBreakpoint={this.props.modalOpts.initialBreakpoint}
          onDidDismiss={() => this.handleTokenDetailClick(null)}
          className="modalPage"
        >
          {this.state.selectedTokenDetail && (
            <TokenDetailDesktopContainer
              setState={(state: any) => this.setState(state)}
              data={this.state.selectedTokenDetail}
              dismiss={() => this.handleTokenDetailClick(null)}
            />
          )}
        </IonModal>
      </>
    );
  }
}

const withStore = (Component: React.ComponentClass<WalletComponentProps>) => {
  // use named function to prevent re-rendering failure
  return function WalletDesktopContainerWithStore(props: {
    // handleDepositClick: (state: boolean) => void;
  }) {
    const { walletAddress, assets, loadAssets } = Store.useState(getWeb3State);

    return (
      <Component 
        walletAddress={walletAddress} 
        assets={assets} 
        modalOpts={{}}
        loadAssets={(force?: boolean)=> loadAssets(force)} />
    );
  };
};
export default withStore(WalletDesktopContainer);
