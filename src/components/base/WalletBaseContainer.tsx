import { IonModal, ModalOptions } from "@ionic/react";
import React from "react";
import { IAsset } from "@/interfaces/asset.interface";
import { DepositContainer } from "@/containers/DepositContainer";
import { HookOverlayOptions } from "@ionic/react/dist/types/hooks/HookOverlayOptions";
import { TransferContainer } from "../../containers/TransferContainer";

export type SelectedTokenDetail = {
  name: string;
  symbol: string;
  priceUsd: number;
  balance: number;
  balanceUsd: number;
  thumbnail: string;
  assets: IAsset[];
};

export interface WalletComponentProps {
  modalOpts: Omit<ModalOptions, "component" | "componentProps"> &
    HookOverlayOptions;
  walletAddress?: string;
  assets: IAsset[];
  loadAssets: (force?: boolean) => Promise<void>;
}

export interface WalletComponentState {
  filterBy: string | null;
  assetGroup: SelectedTokenDetail[];
  totalBalance: number;
  selectedTokenDetail: SelectedTokenDetail | null;
  isEarnModalOpen: boolean;
  isTransferModalOpen: boolean;
  isDepositModalOpen: boolean;
}

export default class WalletBaseComponent<T> extends React.Component<
  T & WalletComponentProps,
  WalletComponentState
> {
  constructor(props: T & WalletComponentProps) {
    super(props);
    this.state = {
      filterBy: null,
      selectedTokenDetail: null,
      assetGroup: [],
      totalBalance: 0,
      isEarnModalOpen: false,
      isTransferModalOpen: false,
      isDepositModalOpen: false,
    };
  }

  componentDidMount() {
    this.calculateBalance();
    this.groupAssets();
  }

  componentDidUpdate(
    prevProps: Readonly<WalletComponentProps>,
    prevState: Readonly<WalletComponentState>,
    snapshot?: any
  ): void {
    if (prevProps.assets !== this.props.assets) {
      this.calculateBalance();
      this.groupAssets();
    }
  }

  calculateBalance() {
    if (!this.props.assets) {
      this.setState({ totalBalance: 0 });
      return;
    }
    const totalBalance = this.props.assets.reduce((acc, asset) => {
      return acc + asset.balanceUsd;
    }, 0);
    this.setState({ totalBalance });
  }

  groupAssets() {
    const assetGroup = [...this.props.assets]
      ?.sort((a, b) => b.balanceUsd - a.balanceUsd)
      ?.reduce((acc, asset) => {
        // check existing asset symbol
        const symbol = (asset.name.toLowerCase().includes('aave') && asset.name.toLowerCase() !== 'aave token')
        ? asset.name.split(' ').pop()||asset.symbol
        : asset.symbol;
        const name = (asset.name.toLowerCase().includes('aave') && asset.name.toLowerCase() !== 'aave token')
        ? asset.name.split(' ').pop()||asset.name
        : asset.name;


        const index = acc.findIndex((a) => a.symbol === symbol);
        if (index !== -1) {
          const balanceUsd = (asset.balanceUsd <= 0 && asset.balance > 0 )
            ? acc[index].priceUsd * asset.balance
            : asset.balanceUsd;
          acc[index].balance += asset.balance;
          acc[index].balanceUsd += balanceUsd;
          acc[index].assets.push(asset);
        } else {
          acc.push({
            name: name,
            symbol: symbol,
            priceUsd: asset.priceUsd,
            thumbnail: asset.thumbnail,
            balance: asset.balance,
            balanceUsd: asset.balanceUsd,
            assets: [asset],
          });
        }
        return acc;
      }, [] as { name: string; symbol: string; priceUsd: number; balance: number; balanceUsd: number; thumbnail: string; assets: IAsset[] }[])
    this.setState({ assetGroup });
  }

  async handleSearchChange(e: CustomEvent) {
    this.setState({ filterBy: e.detail.value });
  }

  async handleTokenDetailClick(token: any = null) {
    console.log(token);
    this.setState((prev) =>({ 
      ...prev, 
      selectedTokenDetail: token
    }));
  }

  async handleEarnClick() {
    this.setState({ isEarnModalOpen: !this.state.isEarnModalOpen });
  }

  async handleTransferClick(state: boolean) {
    console.log('handleTransferClick', state)
    this.setState({isTransferModalOpen: state});
  }

  async handleDepositClick(state?: boolean) {
    this.setState({
      isDepositModalOpen:
        state !== undefined ? state : !this.state.isDepositModalOpen,
    });
  }

  async handleRefresh(){
    this.props.loadAssets(true);
  }

  render(): React.ReactNode {
    return (
      <>
        <IonModal
          isOpen={Boolean(this.state.isTransferModalOpen)}
          breakpoints={this.props.modalOpts.breakpoints}
          initialBreakpoint={this.props.modalOpts.initialBreakpoint}
          onDidDismiss={() => this.handleTransferClick(false)}
        >
          <TransferContainer dismiss={() => this.handleTransferClick(false)} />
        </IonModal>

        <IonModal
          isOpen={this.state.isDepositModalOpen}
          breakpoints={this.props.modalOpts.breakpoints}
          initialBreakpoint={this.props.modalOpts.initialBreakpoint}
          onDidDismiss={() => this.handleDepositClick(false)}
        >
          <DepositContainer dismiss={() => this.handleDepositClick(false)}  
          />
        </IonModal>
        
      </>
    );
  }
}
