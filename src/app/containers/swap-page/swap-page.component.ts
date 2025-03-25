import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BigintToNumberPipe } from '@app/pipes/bigint-to-number/bigint-to-number.pipe';
import { ToDecimalPipe } from '@app/pipes/to-decimal/to-decimal.pipe';
import { LIFIService } from '@app/services/lifi/lifi.service';
import {
  AlertController,
  IonAvatar,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonContent,
  IonFooter,
  IonGrid,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonRow,
  IonSearchbar,
  IonText,
  IonTitle,
  IonToolbar,
  LoadingController,
  ModalController,
} from '@ionic/angular/standalone';
import { LiFiStep, Token, TokenAmount } from '@lifi/sdk';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { addIcons } from 'ionicons';
import { close } from 'ionicons/icons';
import { ToChainImgPipe } from '@app/pipes/to-chain-img/to-chain-img.pipe';
import { ToBalanceCurrencyPipe } from '@app/pipes/to-balance-currency/to-balance-currency.pipe';

const UIElements = [
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonSearchbar,
  IonList,
  IonItem,
  IonLabel,
  IonAvatar,
  IonInput,
  IonFooter,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonModal,
  IonHeader,
  IonButtons,
  IonIcon,
  IonTitle,
  IonText,
];
@Component({
  selector: 'app-swap-page',
  templateUrl: './swap-page.component.html',
  styleUrls: ['./swap-page.component.scss'],
  imports: [
    ...UIElements,
    FormsModule,
    CommonModule,
    BigintToNumberPipe,
    ToDecimalPipe,
    ToChainImgPipe,
    ToBalanceCurrencyPipe
  ],
})
export class SwapPageComponent implements OnInit {

  @Input() public fromTokensList?: TokenAmount[];
  @Input() public fromToken: TokenAmount | undefined = undefined;
  public fromTokenAmount?: number;
  
  @Input() public toTokensList?: Token[];
  @Input() public toToken?: Token;

  public allAvailableTokens: Token[] = [];
  
  public readonly walletTokens$: Observable<TokenAmount[]>;
  
  public readonly quote$ = new BehaviorSubject<LiFiStep | null>(null);
  public searchTerm$ = new BehaviorSubject<string | null>(null);
  public isSearchOpen = false;

  constructor(private readonly _lifiService: LIFIService) {
    addIcons({
      close,
    });
    this.walletTokens$ = combineLatest([
      this._lifiService.walletTokens$,
      this.searchTerm$.asObservable(),
    ]).pipe(
      map(([tokens, searchTerm]) => {
        if (!searchTerm) {
          return tokens;
        }
        return tokens.filter((token) =>
          token.symbol.toLowerCase().includes(searchTerm.toLowerCase())
        );
      })
    );
  }

  async ngOnInit() {
    this.allAvailableTokens = await this._lifiService
    .getAvailableTokens()
    .then((tokens) => Object.values(tokens).flat());
  }

  async search($event: any) {
    const value = $event?.detail?.value;
    if (!value) {
      this.searchTerm$.next(null);
      this.allAvailableTokens = await this._lifiService
        .getAvailableTokens()
        .then((tokens) => Object.values(tokens).flat());
      return;
    }
    if (value.length < 2) {
      return;
    }
    this.searchTerm$.next(value);
    if (!this.toToken) {
      this.allAvailableTokens = await this._lifiService
        .getAvailableTokens()
        .then((tokens) =>
          Object.values(tokens)
            .flat()
            .filter((token) =>
              token.symbol.toLowerCase().includes(value.toLowerCase())
            )
        );
    }
  }

  async requestQuote() {
    // datavalidation
    if (!this.fromToken || !this.toToken || !this.fromTokenAmount) {
      return;
    }
    const ionLoader = await new LoadingController().create({
      message: 'Request quote...',
    });
    await ionLoader.present();
    try {
      // get quote
      const quote = await this._lifiService.requestLiFiQuote({
        fromAmount: this.fromTokenAmount,
        fromChainId: this.fromToken.chainId,
        fromTokenAddress: this.fromToken.address as `0x${string}`,
        toChainId: this.toToken.chainId,
        toTokenAddress: this.toToken.address as `0x${string}`,
      });
      this.quote$.next(quote);
    } catch (error) {
      throw error;
    }
    await ionLoader.dismiss();
  }

  async executeQuote() {
    if (!this.quote$.value) {
      return;
    }
    const ionLoader = await new LoadingController().create({
      message: 'Executing swap...',
    });
    await ionLoader.present();
    const receipts = await this._lifiService.executeSwap(this.quote$.value);
    ionLoader.dismiss();
    console.log({ receipts });
    // display confirm message et error if no receipt
    if (!receipts.length) {
      throw new Error('No receipts found');
    } else {
      const ionSuccess = await new AlertController().create({
        header: 'Swap executed',
        message: `
          Swap executed successfully with following transaction hash: ${receipts[0]}. 
          You wallet has been debited from ${this.quote$.value.action.fromAmount} ${this.quote$.value.action.fromToken.symbol} 
          and credited with ${this.quote$.value.estimate.toAmount} ${this.quote$.value.action.toToken.symbol}.
        `,
        buttons: ['OK'],
      });
      await ionSuccess.present();
      // update wallet token list and balance
      this._lifiService.init();
      await ionSuccess.onDidDismiss();
      // close modal
      const modalCtrl = new ModalController();
      await modalCtrl.dismiss();
    }
  }
}
