import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { MarketPool, MarketPoolGroup } from "@app/models/market-pool.interface";
import { ToChainImgPipe } from "@app/pipes/to-chain-img/to-chain-img.pipe";
import { ToChainNamePipe } from "@app/pipes/to-chain-name/to-chain-name.pipe";
import {
  IonAccordion,
  IonAccordionGroup,
  IonAvatar,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonText,
} from "@ionic/angular/standalone";
import { addIcons } from "ionicons";
import {
  downloadOutline,
  shareOutline,
  walletOutline,
} from "ionicons/icons";
import { CardComponent } from "../card/card.component";

const UIElements = [
  IonList,
  IonItem,
  IonLabel,
  IonText,
  IonAvatar,
  IonAccordion,
  IonAccordionGroup,
  IonIcon,
];

@Component({
  selector: "app-market-pool-group-item",
  templateUrl: "./market-pool-group-item.component.html",
  styleUrls: ["./market-pool-group-item.component.scss"],
  imports: [...UIElements, CommonModule, ToChainImgPipe, ToChainNamePipe, CardComponent],
})
export class MarketPoolGroupItemComponent implements OnInit {

  @Input() public group!: MarketPoolGroup;
  @Output() public readonly selectedMarketPool: EventEmitter<MarketPool> = new EventEmitter();

  constructor() {
    addIcons({
      downloadOutline,
      shareOutline,
      walletOutline,
    });
  }

  ngOnInit() {}
}
