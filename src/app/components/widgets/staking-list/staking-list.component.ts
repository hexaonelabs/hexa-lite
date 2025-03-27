import { CommonModule } from "@angular/common";
import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { getBaseAPRstETH, getBaseAPRstMATIC } from "@app/app.utils";
import { CardComponent } from "@app/components/ui/card/card.component";
import { StakingToken } from "@app/models/staking-token.interface";
import { WalletconnectService } from "@app/services/walletconnect/walletconnect.service";
import {
  IonAvatar,
  IonItem,
  IonLabel,
  IonList,
  IonSkeletonText,
  IonText,
  LoadingController,
} from "@ionic/angular/standalone";
import { getToken, getTokenBalance, Token, TokenAmount } from "@lifi/sdk";
import { firstValueFrom } from "rxjs";
import { arbitrum, base, optimism, polygon } from "viem/chains";

const UIElements = [
  IonList,
  IonItem,
  IonLabel,
  IonText,
  IonAvatar,
  IonSkeletonText,
];

const ETH_TOKENS = async (walletAddress?: string) => {
  return {
    from: [
      walletAddress
        ? await getToken(arbitrum.id, "ETH").then(
            async (token) =>
              (await getTokenBalance(walletAddress, token)) || token
          )
        : await getToken(arbitrum.id, "ETH"),
      walletAddress
        ? await getToken(arbitrum.id, "WETH").then(
            async (token) =>
              (await getTokenBalance(walletAddress, token)) || token
          )
        : await getToken(arbitrum.id, "WETH"),
      walletAddress
        ? await getToken(optimism.id, "ETH").then(
            async (token) =>
              (await getTokenBalance(walletAddress, token)) || token
          )
        : await getToken(optimism.id, "ETH"),
      walletAddress
        ? await getToken(optimism.id, "WETH").then(
            async (token) =>
              (await getTokenBalance(walletAddress, token)) || token
          )
        : await getToken(optimism.id, "WETH"),

      walletAddress
        ? await getToken(base.id, "ETH").then(
            async (token) =>
              (await getTokenBalance(walletAddress, token)) || token
          )
        : await getToken(base.id, "ETH"),
      walletAddress
        ? await getToken(base.id, "WETH").then(
            async (token) =>
              (await getTokenBalance(walletAddress, token)) || token
          )
        : await getToken(base.id, "WETH"),
      walletAddress
        ? await getToken(polygon.id, "WETH").then(
            async (token) =>
              (await getTokenBalance(walletAddress, token)) || token
          )
        : await getToken(polygon.id, "WETH"),
    ],
    to: [
      await getToken(arbitrum.id, "wstETH"),
      await getToken(optimism.id, "wstETH"),
      await getToken(base.id, "wstETH"),
      await getToken(polygon.id, "wstETH"),
    ],
  };
};

const POL_TOKENS = async (walletAddress?: string) => {
  return {
    from: [
      walletAddress
        ? await getToken(polygon.id, "POL").then(
            async (token) =>
              (await getTokenBalance(walletAddress, token)) || token
          )
        : await getToken(polygon.id, "POL"),
      walletAddress
        ? await getToken(polygon.id, "WPOL").then(
            async (token) =>
              (await getTokenBalance(walletAddress, token)) || token
          )
        : await getToken(polygon.id, "WPOL"),
    ],
    to: [await getToken(polygon.id, "stMATIC")],
  };
};

@Component({
  selector: "app-staking-list",
  templateUrl: "./staking-list.component.html",
  styleUrls: ["./staking-list.component.scss"],
  imports: [CardComponent, ...UIElements, CommonModule],
})
export class StakingListComponent implements OnInit {
  public stakingList?: StakingToken[];
  @Output() public selectedStaking: EventEmitter<StakingToken & {from: TokenAmount[]; to: Token[];}> =
    new EventEmitter();
  constructor(private readonly _walletService: WalletconnectService) {}

  async ngOnInit() {
    this.stakingList = [
      {
        imageURL:
          "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
        symbol: "ETH",
        apy: (await getBaseAPRstETH()).apr,
        provider: "Lido",
      },
      {
        imageURL:
          "https://static.debank.com/image/matic_token/logo_url/matic/6f5a6b6f0732a7a235131bd7804d357c.png",
        symbol: "POL",
        apy: (await getBaseAPRstMATIC()).apr,
        provider: "Lido",
      },
    ];
  }

  async selectStaking(staking: StakingToken) {
    const ionLoader = await new LoadingController().create();
    await ionLoader.present();
    const walletAddress = await firstValueFrom(
      this._walletService.walletAddress$
    ) || undefined;
    const from = [];
    const to = [];
    switch (staking.symbol) {
      case "ETH":
        const ethTokens = await ETH_TOKENS(walletAddress);
        from.push(...ethTokens.from);
        to.push(...ethTokens.to);
        break;
      case "POL":
        const polTokens = await POL_TOKENS(walletAddress);
        from.push(...polTokens.from);
        to.push(...polTokens.to);
        break;
      default:
        throw new Error("Invalid staking token");
    }
    this.selectedStaking.emit({
      ...staking,
      from,
      to,
    });
    await ionLoader.dismiss();
  }
}
