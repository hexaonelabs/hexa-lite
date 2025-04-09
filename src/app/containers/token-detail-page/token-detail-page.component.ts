import { CommonModule } from "@angular/common";
import { Component, Input, OnInit } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { CardComponent } from "@app/components/ui/card/card.component";
import { Coin } from "@app/models/coingecko.interface";
import { CoingeckoService } from "@app/services/coingecko/coingecko.service";
import { LIFIService } from "@app/services/lifi/lifi.service";
import {
  IonLabel,
  IonBackButton,
  IonButtons,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonRow,
  IonText,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonFooter,
  IonButton,
  IonIcon,
  IonSpinner,
  IonRouterLink,
  IonModal,
} from "@ionic/angular/standalone";
import { BehaviorSubject, map, Observable, tap } from "rxjs";
import { addIcons } from "ionicons";
import { star, starOutline } from "ionicons/icons";
import { ChartComponent } from "@app/components/widgets/chart/chart.component";
import { SwapPageComponent } from "../swap-page/swap-page.component";
import { ToBalanceCurrencyPipe } from "@app/pipes/to-balance-currency/to-balance-currency.pipe";
import { BigintToNumberPipe } from "@app/pipes/bigint-to-number/bigint-to-number.pipe";
import { ToDecimalPipe } from "@app/pipes/to-decimal/to-decimal.pipe";
import { ShortNumberPipe } from "@app/pipes/short-number/short-number.pipe";

const UIElements = [
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonBackButton,
  IonButtons,
  IonButton,
  IonText,
  IonLabel,
  IonList,
  IonItem,
  IonFooter,
  IonIcon,
  IonSpinner,
  IonModal,
];

@Component({
  selector: "app-token-detail-page",
  templateUrl: "./token-detail-page.component.html",
  styleUrls: ["./token-detail-page.component.scss"],
  imports: [
    ...UIElements,
    CommonModule,
    CardComponent,
    ChartComponent,
    RouterLink,
    IonRouterLink,
    SwapPageComponent,
    ShortNumberPipe,
  ],
})
export class TokenDetailPageComponent implements OnInit {
  @Input() token?: Coin | undefined | null;
  public readonly fromModal!: boolean;
  public walletBalance$!: Observable<{
    amount: number;
    balanceUSD: number;
  } | null>;
  public isFavorite = false;
  public isSwapPageVisible$ = new BehaviorSubject<boolean>(false);

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _coingeckService: CoingeckoService,
    private readonly _lifiService: LIFIService
  ) {
    addIcons({ star, starOutline });
    this.fromModal = !Boolean(this._route.snapshot.paramMap.get("id"));
  }

  async ngOnInit() {
    const id = this._route.snapshot.paramMap.get("id")!;
    if (id) {
      this.token = await this._coingeckService
        .getTop1000Coins()
        .then((l) => l.find((c) => c.id === id));
    }
    if (!this.token) {
      this.token = null;
      throw new Error("Token not found:" + id);
    }
    console.log('xxxxx');
    
    this.walletBalance$ = this._lifiService.walletTokens$.pipe(
      tap((tokens) => console.log({ tokens })),
      map((tokens) => {
        const selectedTokens = tokens
          .filter(
            (t) => t.symbol.toLowerCase() === this.token?.symbol?.toLowerCase()
          )
        const result = selectedTokens
          .reduce((acc, t) => {
            return (
              acc +
              (t.symbol.toLowerCase() === this.token!.symbol.toLowerCase()
                ? Number(t.amount)
                : 0)
            );
          }, 0);
        const decimals = selectedTokens?.[0]?.decimals;
        if (!decimals) {
          return 0;
        }
        return new ToDecimalPipe().transform(result, selectedTokens[0].decimals);
      }),
      map((amount) => ({
        amount,
        balanceUSD: amount * (this.token?.current_price || 0),
      }))
    );
    this.isFavorite = await this._coingeckService.isFavorite(this.token.id);
  }

  async toggleFavorite() {
    this.isFavorite = !this.isFavorite;
    await this._coingeckService.toggleFavorite(this.token!.id);
  }
}
