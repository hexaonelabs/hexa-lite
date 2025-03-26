import { ReserveDataHumanized } from "@aave/contract-helpers";
import {
  ComputedUserReserve,
  FormatReserveUSDResponse,
  FormatUserSummaryResponse,
} from "@aave/math-utils";
import { CommonModule } from "@angular/common";
import { Component, Input, OnInit } from "@angular/core";
import { CardComponent } from "@app/components/ui/card/card.component";
import { MarketPool } from "@app/models/market-pool.interface";
import { ToChainNamePipe } from "@app/pipes/to-chain-name/to-chain-name.pipe";
import { AAVEV3Service } from "@app/services/aave-v3/aave-v3.service";
import { LIFIService } from "@app/services/lifi/lifi.service";
import { WalletconnectService } from "@app/services/walletconnect/walletconnect.service";
import {
  IonAvatar,
  IonButton,
  IonCol,
  IonContent,
  IonFooter,
  IonGrid,
  IonItem,
  IonLabel,
  IonList,
  IonRow,
  IonText,
  IonToolbar,
} from "@ionic/angular/standalone";
import { getToken, getTokenBalance, Token, TokenAmount } from "@lifi/sdk";
import { BehaviorSubject, firstValueFrom } from "rxjs";

const UIElements = [
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonAvatar,
  IonText,
  IonList,
  IonItem,
  IonButton,
  IonLabel,
  IonFooter,
  IonToolbar,
];

@Component({
  selector: "app-aavepool-page",
  templateUrl: "./aavepool-page.component.html",
  styleUrls: ["./aavepool-page.component.scss"],
  imports: [...UIElements, CommonModule, CardComponent, ToChainNamePipe],
})
export class AAVEPoolPageComponent implements OnInit {
  @Input() set pool(value: MarketPool) {
    this.marketPool$.next(value);
  }
  public readonly marketPool$ = new BehaviorSubject<MarketPool | null>(null);
  public readonly token$ = new BehaviorSubject<null | any>(null);
  public readonly userReserveData$ = new BehaviorSubject<
    | null
    | ComputedUserReserve<ReserveDataHumanized & FormatReserveUSDResponse>
    | undefined
  >(null);
  public currentHealFactor$ = new BehaviorSubject<null | number>(null);
  public readonly isShowOptionsVisible$ = new BehaviorSubject<null | any>(
    false
  );

  constructor(
    private readonly _walletService: WalletconnectService,
    private readonly _aavev3Service: AAVEV3Service
  ) {}

  async ngOnInit() {
    if (!this.marketPool$.value) {
      throw new Error("Market pool not set");
    }
    const walletAddress = await firstValueFrom(
      this._walletService.walletAddress$
    );
    const chainId = Number(this.marketPool$.value.id.split("-")[0]);
    const token: Token | TokenAmount = walletAddress
      ? await getToken(chainId, this.marketPool$.value.underlyingAsset).then(
          async (token) =>
            (await getTokenBalance(walletAddress, token)) || token
        )
      : await getToken(chainId, this.marketPool$.value.underlyingAsset);
    this.token$.next(token);
    this.marketPool$.next({
      ...this.marketPool$.value,
      imageURL: token.logoURI,
    });
    const userSummaries: Map<
      number,
      FormatUserSummaryResponse<ReserveDataHumanized & FormatReserveUSDResponse>
    > = (await firstValueFrom(this._aavev3Service.getUserSummaries$())) ||
    new Map();
    const userSummary = userSummaries.get(chainId);
    this.currentHealFactor$.next(Number(userSummary?.healthFactor));
    const userReserveData = userSummary?.userReservesData.find(
      (reserve) => reserve.reserve.id === this.marketPool$.value?.id
    );
    this.userReserveData$.next(userReserveData);
    console.log("token", {
      token,
      userReserveData,
      userSummary,
      pool: this.marketPool$.value,
    });
  }
}
