import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { BigintToNumberPipe } from '@app/pipes/bigint-to-number/bigint-to-number.pipe';
import { ShortNumberPipe } from '@app/pipes/short-number/short-number.pipe';
import { ToBalanceCurrencyPipe } from '@app/pipes/to-balance-currency/to-balance-currency.pipe';
import { ToDecimalPipe } from '@app/pipes/to-decimal/to-decimal.pipe';
import { IonGrid, IonRow, IonCol, IonCard, IonCardContent, IonList, IonItem, IonLabel, IonAvatar } from '@ionic/angular/standalone';
import { TokenAmount } from '@lifi/sdk';

const UIElements = [
  IonGrid,
  IonRow, 
  IonCol,
  IonItem,
  IonLabel,
  IonAvatar,
];

@Component({
  selector: 'app-wallet-token-item',
  templateUrl: './wallet-token-item.component.html',
  styleUrls: ['./wallet-token-item.component.scss'],
  imports: [
    ...UIElements,
    CommonModule,
    BigintToNumberPipe,
    ToDecimalPipe,
    ToBalanceCurrencyPipe,
    ShortNumberPipe,
  ],
})
export class WalletTokenItemComponent  implements OnInit {

  @Input() public token!: TokenAmount;
  @Input() public totalWalletWorth: number = 0;
  @Input() public lines?: string;

  constructor() { }

  ngOnInit() {}

}
