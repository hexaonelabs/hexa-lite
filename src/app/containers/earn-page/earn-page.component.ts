import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '@app/components/ui/card/card.component';
import { AAVEV3ListComponent } from '@app/components/widgets/aavev3-list/aavev3-list.component';
import { StakingListComponent } from '@app/components/widgets/staking-list/staking-list.component';
import { StakingToken } from '@app/models/staking-token.interface';
import { IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCol, IonContent, IonGrid, IonItem, IonLabel, IonList, IonRow, IonSearchbar, IonSegment, IonSegmentButton, IonText, IonToolbar } from '@ionic/angular/standalone';
import { Token, TokenAmount } from '@lifi/sdk';

const UIElements = [
  IonGrid,
  IonRow,
  IonCol,
  IonLabel,
  IonSegment,
  IonSegmentButton,
  IonToolbar,
  IonContent,
  IonSearchbar,
];

@Component({
  selector: 'app-earn-page',
  templateUrl: './earn-page.component.html',
  styleUrls: ['./earn-page.component.scss'],
  imports: [...UIElements, CommonModule, FormsModule, StakingListComponent, AAVEV3ListComponent]
})
export class EarnPageComponent  implements OnInit {

  public segment: 'staking' | 'loans' | 'vaults' = 'loans';
  public filterTerm = '';
  @Output() public selectedStaking: EventEmitter<StakingToken & {from: TokenAmount[]; to: Token[]}> = new EventEmitter();
  @Output() public selectedMarketPool: EventEmitter<{from: TokenAmount; to: Token; action: string;}> = new EventEmitter();

  constructor() { }

  ngOnInit() {}

}
