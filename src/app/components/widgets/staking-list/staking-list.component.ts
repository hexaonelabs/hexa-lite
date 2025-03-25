import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { getBaseAPRstETH, getBaseAPRstMATIC } from '@app/app.utils';
import { CardComponent } from '@app/components/ui/card/card.component';
import { StakingToken } from '@app/models/staking-token.interface';
import { IonAvatar, IonItem, IonLabel, IonList, IonSkeletonText, IonText } from '@ionic/angular/standalone';
import { getToken, Token } from '@lifi/sdk';
import { arbitrum, base, optimism, polygon } from 'viem/chains';

const UIElements = [
  IonList,
  IonItem,
  IonLabel,
  IonText,
  IonAvatar,
  IonSkeletonText,
];



@Component({
  selector: 'app-staking-list',
  templateUrl: './staking-list.component.html',
  styleUrls: ['./staking-list.component.scss'],
  imports: [CardComponent, ...UIElements, CommonModule]
})
export class StakingListComponent  implements OnInit {

  public stakingList?: StakingToken[];
  @Output() public selectedStaking: EventEmitter<StakingToken> = new EventEmitter();
  constructor() { }

  async ngOnInit() {
    this.stakingList = [
      { 
        imageURL: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
        symbol: 'ETH',
        apy: (await getBaseAPRstETH()).apr,
        provider: 'Lido',
        from: [
          await getToken(arbitrum.id, 'ETH'),
          await getToken(arbitrum.id, 'WETH'),
          await getToken(optimism.id, 'ETH'),
          await getToken(optimism.id, 'WETH'),
          await getToken(base.id, 'ETH'),
          await getToken(base.id, 'WETH'),
          await getToken(polygon.id, 'WETH'),
        ],
        to: [
          await getToken(arbitrum.id, 'wstETH'),
          await getToken(optimism.id, 'wstETH'),
          await getToken(base.id, 'wstETH'),
          await getToken(polygon.id, 'wstETH'),
        ],
      },
      {
        imageURL: 'https://static.debank.com/image/matic_token/logo_url/matic/6f5a6b6f0732a7a235131bd7804d357c.png',
        symbol: 'POL',
        apy: (await getBaseAPRstMATIC()).apr,
        provider: 'Lido',
        from: [
          await getToken(polygon.id, 'POL'),
          await getToken(polygon.id, 'WPOL'),
        ],
        to: [
          await getToken(polygon.id, 'stMATIC'),
        ]
      }
    ];
  }

}
