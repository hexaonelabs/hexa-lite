import { Component, OnInit } from '@angular/core';
import { CardComponent } from '@app/components/ui/card/card.component';
import { IonItem, IonLabel, IonList, IonText } from '@ionic/angular/standalone';

const UIElements = [
  IonList,
  IonItem,
  IonLabel,
  IonText,
];

@Component({
  selector: 'app-staking-list',
  templateUrl: './staking-list.component.html',
  styleUrls: ['./staking-list.component.scss'],
  imports: [CardComponent, ...UIElements]
})
export class StakingListComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
