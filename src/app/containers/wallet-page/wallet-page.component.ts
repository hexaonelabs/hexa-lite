import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { WalletTokenItemComponent } from "@app/components/ui/wallet-token-item/wallet-token-item.component";
import { LIFIService } from "@app/services/lifi/lifi.service";
import { WalletconnectService } from "@app/services/walletconnect/walletconnect.service";
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonRouterLink,
  IonRow,
  IonText,
  IonTitle,
  IonToggle,
  IonToolbar,
} from "@ionic/angular/standalone";
import { Token, TokenAmount } from "@lifi/sdk";
import { BehaviorSubject, firstValueFrom, Observable } from "rxjs";
import { addIcons } from "ionicons";
import {
  powerOutline,
  arrowDownCircleOutline,
  arrowUpCircleOutline,
  close,
  swapHorizontal,
  settingsOutline,
} from "ionicons/icons";
import { Router, RouterLink } from "@angular/router";
import { SwapPageComponent } from "../swap-page/swap-page.component";
import { EarnPageComponent } from "../earn-page/earn-page.component";
import { SearchFooterComponent } from "@app/components/widgets/search-footer/search-footer.component";
import { SearchPageComponent } from "../search-page/search-page.component";
import { ToCoingeckoIdPipe } from "@app/pipes/to-coingecko-id/to-coingecko-id.pipe";
import { CardComponent } from "@app/components/ui/card/card.component";
import { FormsModule } from "@angular/forms";
import { toggleDarkPalette } from "@app/app.utils";
import { StakingToken } from "@app/models/staking-token.interface";
import { SettingsPageComponent } from "../settings-page/settings-page.component";
import { ShortNumberPipe } from "@app/pipes/short-number/short-number.pipe";

const UIElements = [
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonText,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonIcon,
];

const CONTAINERS = [
  SwapPageComponent,
  EarnPageComponent,
  SearchPageComponent,
  SettingsPageComponent,
];

const UIComponents = [WalletTokenItemComponent, SearchFooterComponent];

const PIPES = [ToCoingeckoIdPipe, ShortNumberPipe];

@Component({
  selector: "app-wallet-page",
  templateUrl: "./wallet-page.component.html",
  styleUrls: ["./wallet-page.component.scss"],
  imports: [
    ...CONTAINERS,
    ...UIComponents,
    ...UIElements,
    ...PIPES,
    CommonModule,
    RouterLink,
    IonRouterLink,
  ],
})
export class WalletPageComponent implements OnInit {
  public readonly walletAddress$: Observable<string | null>;
  public readonly walletTokens$: Observable<TokenAmount[]>;
  public readonly walletBalance$: Observable<number>;
  public isSwapPageVisible$ = new BehaviorSubject<boolean>(false);
  public isDepositPageVisible$ = new BehaviorSubject<boolean>(false);
  public isSendPageVisible$ = new BehaviorSubject<boolean>(false);
  public isEarnPageVisible$ = new BehaviorSubject<boolean>(false);
  public isSearchPageVisible$ = new BehaviorSubject<boolean>(false);
  public isSettingsPageVisible$ = new BehaviorSubject<boolean>(false);
  public selectedStakingToken$ = new BehaviorSubject<
    (StakingToken & { from: TokenAmount[]; to: Token[] }) | null
  >(null);
  public selectedMarketPool$ = new BehaviorSubject<{
    from: TokenAmount;
    to: Token;
    action: string;
  } | null>(null);

  constructor(
    private readonly _walletService: WalletconnectService,
    private readonly _lifi: LIFIService
  ) {
    addIcons({
      powerOutline,
      arrowDownCircleOutline,
      arrowUpCircleOutline,
      close,
      swapHorizontal,
      settingsOutline,
    });
    this.walletAddress$ = this._walletService.walletAddress$;
    this.walletTokens$ = this._lifi.walletTokens$;
    this.walletBalance$ = this._lifi.walletBalance$;
  }

  async ngOnInit() {
    const walletAddress = await firstValueFrom(this.walletAddress$);
    if (!walletAddress) {
      throw new Error("Wallet address not found");
    }
    await this._lifi.init();
  }
}
