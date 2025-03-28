import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { CardComponent } from "@app/components/ui/card/card.component";
import { ToChainImgPipe } from "@app/pipes/to-chain-img/to-chain-img.pipe";
import { ToChainNamePipe } from "@app/pipes/to-chain-name/to-chain-name.pipe";
import { AAVEV3Service } from "@app/services/aave-v3/aave-v3.service";
import { WalletconnectService } from "@app/services/walletconnect/walletconnect.service";
import {
  IonAccordion,
  IonAccordionGroup,
  IonAvatar,
  IonButton,
  IonButtons,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonSkeletonText,
  IonText,
  IonTitle,
  IonToolbar,
  LoadingController,
} from "@ionic/angular/standalone";
import { getToken, Token, TokenAmount } from "@lifi/sdk";
import {
  BehaviorSubject,
  combineLatest,
  firstValueFrom,
  map,
  Observable,
  switchMap,
} from "rxjs";
import { addIcons } from "ionicons";
import {
  downloadOutline,
  shareOutline,
  walletOutline,
  close,
} from "ionicons/icons";
import { MarketPool, MarketPoolGroup } from "@app/models/market-pool.interface";
import { AAVEPoolPageComponent } from "@app/containers/aavepool-page/aavepool-page.component";

const UIElements = [
  IonList,
  IonItem,
  IonLabel,
  IonText,
  IonAvatar,
  IonAccordion,
  IonAccordionGroup,
  IonIcon,
  IonModal,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
];
@Component({
  selector: "app-aavev3-list",
  templateUrl: "./aavev3-list.component.html",
  styleUrls: ["./aavev3-list.component.scss"],
  imports: [
    ...UIElements,
    CommonModule,
    CardComponent,
    ToChainImgPipe,
    ToChainNamePipe,
    AAVEPoolPageComponent,
  ],
})
export class AAVEV3ListComponent implements OnInit {
  @Input() public set filterTerm(value: string | undefined) {
    this._filterTerm$.next(value);
  }
  private readonly _filterTerm$ = new BehaviorSubject<string | undefined>(
    undefined
  );
  public readonly marketPools$: Observable<MarketPool[] | null>;
  public readonly marketPoolsGroups$: Observable<MarketPoolGroup[]>;
  public readonly selectedMarketPool$ = new BehaviorSubject<null | MarketPool>(
    null
  );

  constructor(
    private readonly _aaveV3Servcie: AAVEV3Service,
    private readonly _walletServcie: WalletconnectService
  ) {
    addIcons({
      downloadOutline,
      shareOutline,
      walletOutline,
      close,
    });
    this.marketPools$ = this._aaveV3Servcie.marketPools$;
    this.marketPoolsGroups$ = combineLatest([
      this.marketPools$,
      this._filterTerm$.asObservable(),
    ]).pipe(
      switchMap(async ([marketPools, filterTerm]) => {
        if (!marketPools) {
          return [];
        }
        const marketPoolsGroups: MarketPoolGroup[] = await Promise.all(
          marketPools
            .reduce((acc, pool) => {
              const existingGroup = acc.find(
                (group) => group.symbol === pool.symbol
              );
              if (existingGroup) {
                existingGroup.pools.push(pool);
                existingGroup.chainIds.push(Number(pool.id.split("-")[0]));
                if (
                  Number(existingGroup.topSupplyAPY) <
                  Number(pool.supplyAPY) * 100
                ) {
                  existingGroup.topSupplyAPY = `${
                    Number(pool.supplyAPY) * 100
                  }`;
                }
                if (
                  Number(existingGroup.topBorrowAPY) >
                  Number(pool.variableBorrowAPY) * 100
                ) {
                  existingGroup.topBorrowAPY = `${
                    Number(pool.variableBorrowAPY) * 100
                  }`;
                }
              } else {
                acc.push({
                  chainIds: [Number(pool.id.split("-")[0])],
                  pools: [pool],
                  symbol: pool.symbol,
                  topSupplyAPY: `${Number(pool.supplyAPY) * 100}`,
                  topBorrowAPY: `${Number(pool.variableBorrowAPY) * 100}`,
                });
              }
              return acc;
            }, [] as MarketPoolGroup[])
            .map(async (group) => {
              const token = await getToken(
                group.chainIds[0],
                group.pools[0].underlyingAsset
              );
              return {
                ...group,
                imageURL: token?.logoURI,
              };
            })
        );
        return marketPoolsGroups.filter((group) => {
          return filterTerm
            ? group.symbol
                .toLowerCase()
                .includes(filterTerm?.toLowerCase() ?? "")
            : true;
        });
      }),
      map((groups) => {
        return groups.sort((a, b) => {
          return a.symbol.localeCompare(b.symbol);
        });
      })
    );
  }

  async ngOnInit() {
    const provider = this._walletServcie.getProvider();
    const currentAccount = provider.accounts[0];
    if (!currentAccount) {
      throw new Error("No account found");
    }
    const ionLoading = await new LoadingController().create({
      message: "Loading...",
    });
    await ionLoading.present();
    await this._aaveV3Servcie.init(currentAccount);
    await ionLoading.dismiss();
  }
}
