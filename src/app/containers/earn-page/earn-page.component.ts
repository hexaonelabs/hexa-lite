import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '@app/components/ui/card/card.component';
import { AAVEV3ListComponent } from '@app/components/widgets/aavev3-list/aavev3-list.component';
import { StakingListComponent } from '@app/components/widgets/staking-list/staking-list.component';
import { StakingToken } from '@app/models/staking-token.interface';
import { IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCol, IonContent, IonGrid, IonItem, IonLabel, IonList, IonRow, IonSearchbar, IonSegment, IonSegmentButton, IonText, IonToolbar } from '@ionic/angular/standalone';

const UIElements = [
  IonGrid,
  IonRow,
  IonCol,
  IonItem,
  IonLabel,
  IonText,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
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
  @Output() public selectedStaking: EventEmitter<StakingToken> = new EventEmitter();

  constructor() { }

  ngOnInit() {}

  handleSelect($event: any) {
    console.log($event);
  }

}
