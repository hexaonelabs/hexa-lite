import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CardComponent } from '@app/components/ui/card/card.component';
import { Coin } from '@app/models/coingecko.interface';
import { CoingeckoService } from '@app/services/coingecko/coingecko.service';
import {
  InfiniteScrollCustomEvent,
  IonAvatar,
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonRouterLink,
  IonRow,
  IonSearchbar,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { BehaviorSubject, firstValueFrom, Observable, switchMap } from 'rxjs';
import { addIcons } from 'ionicons';
import { close } from 'ionicons/icons';
import { TokenDetailPageComponent } from '../token-detail-page/token-detail-page.component';

const UIElements = [
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonList,
  IonItem,
  IonLabel,
  IonText,
  IonAvatar,
  IonSearchbar,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
];
@Component({
  selector: 'app-search-page',
  templateUrl: './search-page.component.html',
  styleUrls: ['./search-page.component.scss'],
  imports: [
    ...UIElements,
    CommonModule,
    CardComponent,
    RouterLink,
    IonRouterLink,
    TokenDetailPageComponent,
  ],
})
export class SearchPageComponent implements OnInit {
  private readonly _top1000Coins: Promise<Coin[]>;
  public min = 0;
  public max = 25;
  public readonly searchTerm$ = new BehaviorSubject<string>('');
  public readonly searchResult$: Observable<Coin[]>;
  public readonly selectedToken$ = new BehaviorSubject<Coin | null>(null);
  public readonly favoriteTokens$;

  constructor(private readonly _coingeckService: CoingeckoService) {
    addIcons({
      close,
    });
    this._top1000Coins = this._coingeckService.getTop1000Coins();
    this.searchResult$ = this.searchTerm$.pipe(
      switchMap(async (term) => {
        if (!term || term.length < 2) {
          return this._top1000Coins;
        }
        return this._top1000Coins.then((coins) => {
          return coins.filter((coin) =>
            coin.symbol.toLowerCase().includes(term.toLowerCase())
          );
        });
      })
    );
    this.favoriteTokens$ = this.searchTerm$.pipe(
      switchMap(async (term) => {
        const favoriteCoinIds = await firstValueFrom(this._coingeckService.getAllFavotiteCoins$());
        if (!favoriteCoinIds) {
          return null;
        }
        if (!term || term.length < 2) {
          const result = await this._top1000Coins.then((coins) => {
            return coins.filter((coin) => favoriteCoinIds.find(({id}) => id === coin.id));
          });
          if (result.length === 0) {
            return null;
          }
          return result;
        }
        return this._top1000Coins.then((coins) => {
          const result = coins.filter((coin) =>
            coin.symbol.toLowerCase().includes(term.toLowerCase()) && favoriteCoinIds.find(({id}) => id === coin.id)
          );
          if (result.length === 0) {
            return null;
          }
          return result;
        });
      })
    );
  }

  async ngOnInit() {
    
  }

  showMore() {
    this.max += 25;
  }

  async onIonInfinite(event: InfiniteScrollCustomEvent) {
    this.showMore();
    const t = setTimeout(() => {
      event.target.complete();
      clearTimeout(t);
    }, 500);
  }
}
