import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  AlertController,
  IonAvatar,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonText,
  LoadingController,
} from "@ionic/angular/standalone";
import { CardComponent } from "@app/components/ui/card/card.component";
import { addIcons } from "ionicons";
import { openOutline } from "ionicons/icons";
import { ShortNumberPipe } from "@app/pipes/short-number/short-number.pipe";
import {
  getUniswapPools,
  getUniswapPositions,
  PoolData,
  PositionData,
  UNISWAP_MARKETS,
} from "./uniswap-v3-list.utils";
import { ToChainNamePipe } from "@app/pipes/to-chain-name/to-chain-name.pipe";
import { WalletconnectService } from "@app/services/walletconnect/walletconnect.service";
import { firstValueFrom } from "rxjs";
import { LabelListComponent } from "@app/components/ui/label-list/label-list.component";

const UIElements = [IonIcon, IonItem, IonAvatar, IonLabel, IonText, IonButton];

@Component({
  selector: "app-uniswap-v3-list",
  templateUrl: "./uniswap-v3-list.component.html",
  styleUrls: ["./uniswap-v3-list.component.scss"],
  imports: [
    ...UIElements,
    CommonModule,
    CardComponent,
    LabelListComponent,
    ShortNumberPipe,
    ToChainNamePipe,
  ],
})
export class UniswapV3ListComponent implements OnInit {
  public positions: PositionData[] | null = null;
  public pools: PoolData[] | null = null;

  constructor(private readonly _walletService: WalletconnectService) {
    addIcons({
      openOutline,
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
    const pools = await getUniswapPools();
    this.positions = positions;
    this.pools = pools;
    console.log({ positions, pools });
    await ionLoading.dismiss();
  }

  async selectPool(
    pool: Pick<PoolData, "address" | "chainId" | "token0" | "token1">
  ) {
    console.log("Selected pool:", pool);
    // prompt to explain that user will be redirected to Uniswap Pool
    const ionAlert = await new AlertController().create({
      header: "Pool selected",
      message: `You will be redirected to Uniswap Pool for ${pool.token0.symbol} / ${pool.token1.symbol}`,
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
}
