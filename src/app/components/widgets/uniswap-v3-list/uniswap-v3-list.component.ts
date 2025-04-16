import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  AlertController,
  IonAvatar,
  IonBadge,
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonRow,
  IonSkeletonText,
  IonText,
  IonTitle,
  IonToolbar,
  LoadingController,
} from "@ionic/angular/standalone";
import { addIcons } from "ionicons";
import { openOutline, open, close } from "ionicons/icons";
import { CardComponent } from "@app/components/ui/card/card.component";
import { LabelListComponent } from "@app/components/ui/label-list/label-list.component";
import { ShortNumberPipe } from "@app/pipes/short-number/short-number.pipe";
import { ToChainNamePipe } from "@app/pipes/to-chain-name/to-chain-name.pipe";
import { WalletconnectService } from "@app/services/walletconnect/walletconnect.service";
import { BehaviorSubject, firstValueFrom } from "rxjs";
import {
  getUniswapPositions,
  PositionData,
  UNISWAP_MARKETS,
} from "./uniswap-onchain.utils";
import {
  calculateEstimatedFees,
  getPool,
  getPools,
  PoolColumnDataType,
} from "./uniswap-thegraph.utils";
import { getNetworkConfigByChainId } from "./network";
import { arbitrum, optimism } from "viem/chains";
import { FormsModule } from "@angular/forms";
import { ApyPipe } from "./apy.pipe";

const UIElements = [
  IonIcon,
  IonList,
  IonItem,
  IonAvatar,
  IonLabel,
  IonText,
  IonButton,
  IonBadge,
  IonGrid,
  IonRow,
  IonCol,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonInput,
  IonSkeletonText,
];

@Component({
  selector: "app-uniswap-v3-list",
  templateUrl: "./uniswap-v3-list.component.html",
  styleUrls: ["./uniswap-v3-list.component.scss"],
  imports: [
    ...UIElements,
    CommonModule,
    FormsModule,
    CardComponent,
    LabelListComponent,
    ShortNumberPipe,
    ToChainNamePipe,
    ApyPipe,
  ],
})
export class UniswapV3ListComponent implements OnInit {
  public positions: PositionData[] | null = null;
  public pools:
    | (PoolColumnDataType & { chainId: number; address: string })[]
    | null = null;
  public readonly selectedPool$ = new BehaviorSubject<
    (PoolColumnDataType & { chainId: number; address: string }) | null
  >(null);
  public liquidityAmount: number = 1000;
  public feesRewardsEstimation: {
    fee24h: number;
    fee7d: number;
    fee30d: number;
    fee1y: number;
  } | null = null;
  constructor(private readonly _walletService: WalletconnectService) {
    addIcons({
      openOutline,
      open,
      close,
    });
  }

  async ngOnInit() {
    const ionLoading = await new LoadingController().create();
    await ionLoading.present();
    const walletAddress = await firstValueFrom(
      this._walletService.walletAddress$
    );
    if (!walletAddress) {
      throw new Error("No account found");
    }
    const positions = await getUniswapPositions(walletAddress as `0x${string}`);
    this.positions = positions;
    // lazyload network pools and extract result to hide loader
    const { pools } = await Promise.all([
      // load arbitrum pools
      getPools(
        getNetworkConfigByChainId(arbitrum.id).totalValueLockedUSD_gte,
        getNetworkConfigByChainId(arbitrum.id).volumeUSD_gte,
        arbitrum.id
      ).then((result) => {
        // sort and filter pools before adding to the list
        this.pools = this._sortAndFilter([
          ...(this.pools || []),
          ...result.pools.map((pool) => ({
            ...pool,
            chainId: arbitrum.id,
            address: pool.poolId,
          })),
        ]);
        return result;
      }),
      // load optimism pools
      getPools(
        getNetworkConfigByChainId(optimism.id).totalValueLockedUSD_gte,
        getNetworkConfigByChainId(optimism.id).volumeUSD_gte,
        optimism.id
      ).then((result) => {
        // sort and filter pools before adding to the list
        this.pools = this._sortAndFilter([
          ...(this.pools || []),
          ...result.pools.map((pool) => ({
            ...pool,
            chainId: optimism.id,
            address: pool.poolId,
          })),
        ]);
        return result;
      }),
    ])
      // formating result as type PoolColumnDataType[]
      .then((results) =>
        results.reduce(
          (acc, val) => {
            acc.pools = [...acc.pools, ...val.pools];
            acc.tokens = [...acc.tokens, ...val.tokens];
            return acc;
          },
          { pools: [], tokens: [] }
        )
      );
    console.log({ positions, pools });
    await ionLoading.dismiss();
  }

  private _sortAndFilter<
    T extends {
      volume24h: number;
      poolId: string;
    }
  >(pools: T[]): T[] {
    return (
      pools
        .map((pool) => ({
          ...pool,
          address: pool.poolId,
        }))
        // sort by daly volume
        .sort((a, b) => {
          if (a.volume24h > b.volume24h) {
            return -1;
          }
          if (a.volume24h < b.volume24h) {
            return 1;
          }
          return 0;
        })
        // only display pool with hight 24h volume
        .filter((pool) => {
          if (pool.volume24h < 1_000_000) {
            return false;
          }
          return true;
        })
    );
  }

  async openUniswapPool(pool: {
    chainId: number;
    address: string;
    token0: {
      symbol: string;
    };
    token1: {
      symbol: string;
    };
  }) {
    console.log("Selected pool:", pool);
    // prompt to explain that user will be redirected to Uniswap Pool
    const ionAlert = await new AlertController().create({
      header: "Open on Uniswap",
      message: `You will be redirected to Uniswap Pool ${pool.token0.symbol}/${pool.token1.symbol}`,
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
        },
        {
          text: "OK",
          role: "ok",
        },
      ],
    });
    await ionAlert.present();
    const { role } = await ionAlert.onDidDismiss();
    if (role === "ok") {
      // Redirect to Uniswap Pool
      const chainName = UNISWAP_MARKETS.find(
        (market) => market.chain.id === pool.chainId
      )?.name;
      const url = `https://app.uniswap.org/explore/pools/${chainName}/${pool.address}`;
      window.open(url, "_blank");
    }
  }

  async selectPool(pool: {
    chainId: number;
    address: string;
    token0: {
      symbol: string;
    };
    token1: {
      symbol: string;
    };
  }) {
    console.log("Selected pool:", pool);
    const poolData = this.pools?.find(
      (p) => p.address.toLowerCase() === pool.address.toLowerCase() && p.chainId === pool.chainId
    );
    // no pool find
    if (!poolData) {
      console.error("Pool not found");
      return;
    }
    this.selectedPool$.next(poolData);
    await this.calculateEstimatedFees();
  }

  async openUniswap() {
    const url = `https://app.uniswap.org/explore/pools`;
    window.open(url, "_blank");
  }

  async calculateEstimatedFees() {
    this.feesRewardsEstimation = null;
    const pool = await getPool(this.selectedPool$.value!);
    console.log("Pool data:", pool);
    const { estimatedFee24h } = calculateEstimatedFees(
      this.liquidityAmount,
      pool
    );
    this.feesRewardsEstimation = {
      fee24h: estimatedFee24h,
      fee7d: estimatedFee24h * 7,
      fee30d: estimatedFee24h * 30,
      fee1y: estimatedFee24h * 365,
    };
  }
}
