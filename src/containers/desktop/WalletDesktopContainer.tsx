import { card, download, paperPlane } from "ionicons/icons";
import WalletBaseComponent, {
  WalletComponentProps,
} from "../../components/base/WalletBaseContainer";
import {
  IonAvatar,
  IonButton,
  IonCard,
  IonCardContent,
  IonCol,
  IonGrid,
  IonIcon,
  IonLabel,
  IonRow,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonText,
} from "@ionic/react";
import ConnectButton from "@/components/ConnectButton";
import { getAssetIconUrl } from "@/utils/getAssetIconUrl";
import Store from "@/store";
import { getWeb3State } from "@/store/selectors";
import { CHAIN_AVAILABLES } from "@/constants/chains";

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
                <h1 style={{ marginTop: 0, fontSize: "2.2rem" }}>Wallet</h1>
              </IonText>
              <IonText>
                <p className="ion-no-margin" style={{ fontSize: "1.6rem" }}>
                  $ {this.state.totalBalance.toFixed(2)}
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
                  className="ion-no-margin"
                  onClick={() => {}}
                >
                  <IonCardContent>
                    <IonGrid>
                      <IonRow className="ion-align-items-center">
                        <IonCol size="auto" class="ion-text-center">
                          <IonIcon icon={card} size="large" color="dark" />
                        </IonCol>
                        <IonCol class="ion-text-start ion-padding">
                          <IonText color="dark">
                            <h2>Buy crypto</h2>
                            <p>
                              You have to get ETH to use your wallet. Buy with
                              credit card or with Apple Pay
                            </p>
                          </IonText>
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
                  className="ion-no-margin"
                  onClick={() => {}}
                >
                  <IonCardContent>
                    <IonGrid>
                      <IonRow className="ion-align-items-center">
                        <IonCol size="auto" class="ion-text-center">
                          <IonIcon icon={card} size="large" color="dark" />
                        </IonCol>
                        <IonCol class="ion-text-start ion-padding">
                          <IonText color="dark">
                            <h2>Deposit assets</h2>
                            <p>
                              Transfer tokens from another wallet or from a
                              crypto exchange
                            </p>
                          </IonText>
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
              <IonRow style={{ marginTop: "3rem" }}>
                <IonCol size="auto">
                  <IonSearchbar 
                  placeholder="Search by symbol"              
                  onIonInput={(e) => {
                    this.handleSearchChange(e);
                }} />
                </IonCol>
              </IonRow>
              <IonRow class="widgetWrapper" style={{ marginTop: "1rem" }}>
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
                        size="auto"
                        className="ion-align-self-start"
                        style={{ display: "flex" }}
                      >
                        <IonLabel color="medium" className="ion-padding-start">
                          Asset
                        </IonLabel>
                      </IonCol>
                      <IonCol
                        size="6"
                        className="ion-text-end ion-align-self-stretch"
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <IonLabel color="medium" className="ion-text-end">
                          Price
                        </IonLabel>
                        <IonLabel
                          color="medium"
                          className="ion-text-end ion-hide-md-down"
                        >
                          Balance
                        </IonLabel>
                        <IonLabel color="medium" className="ion-text-end">
                          Value
                        </IonLabel>
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
                      <IonGrid
                        key={index}
                        class="ion-padding-vertical"
                        onClick={() => {
                          console.log("asset", asset);
                        }}
                        style={{
                          borderBottom:
                            "solid 1px rgba(var(--ion-color-primary-rgb), 0.2)",
                        }}
                      >
                        <IonRow className="ion-align-items-center ion-justify-content-between">
                          <IonCol
                            size="auto"
                            className="ion-align-self-start ion-padding-start"
                            style={{ display: "flex" }}
                          >
                            <IonAvatar
                              style={{
                                overflow: "hidden",
                                width: "56px",
                                height: "56px",
                              }}
                            >
                              <img
                                src={getAssetIconUrl({
                                  symbol:
                                    asset.name.toLowerCase().includes("aave") &&
                                    asset.name.toLowerCase() !== "aave token"
                                      ? asset.name.split(" ").pop() ||
                                        asset.symbol
                                      : asset.symbol,
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
                            <IonLabel className="ion-padding-start">
                              <h2>{asset.symbol}</h2>
                              <IonText color="medium">
                                <p>{asset.name}</p>
                              </IonText>
                            </IonLabel>
                          </IonCol>
                          <IonCol
                            size="6"
                            className="ion-text-end ion-align-self-stretch ion-padding-end"
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <IonLabel className="ion-text-end ion-hide-md-down">
                              <IonText color="dark">
                                <p>$ {asset.priceUsd.toFixed(2)}</p>
                              </IonText>
                            </IonLabel>
                            <IonLabel className="ion-text-end ion-hide-md-down">
                              <IonText color="dark">
                                <p>{asset.balance.toFixed(2)}</p>
                              </IonText>
                            </IonLabel>
                            <IonLabel className="ion-text-end">
                              <IonText color="dark">
                                <h2>$ {asset.balanceUsd.toFixed(2)}</h2>
                              </IonText>
                            </IonLabel>
                          </IonCol>
                        </IonRow>
                      </IonGrid>
                    );
                  })}
                </IonCol>
              </IonRow>
            </>
          )}
        </IonGrid>
      </>
    );
  }
}

const withStore = (Component: React.ComponentClass<WalletComponentProps>) => {
  // use named function to prevent re-rendering failure
  return function WalletDesktopContainerWithStore() {
    const { walletAddress, assets } = Store.useState(getWeb3State);

    return (
      <Component walletAddress={walletAddress} assets={assets} modalOpts={{}} />
    );
  };
};
export default withStore(WalletDesktopContainer);
