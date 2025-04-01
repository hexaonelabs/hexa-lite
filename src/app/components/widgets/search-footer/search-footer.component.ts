import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { IonButton, IonCol, IonFooter, IonGrid, IonIcon, IonRow, IonSearchbar, IonToolbar } from '@ionic/angular/standalone';
import { searchOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';

const UIElements = [
  IonIcon,
  IonFooter,
  IonToolbar,
  IonButton,
  IonSearchbar,
  IonGrid,
  IonRow,
  IonCol,
];

@Component({
  selector: 'app-search-footer',
  templateUrl: './search-footer.component.html',
  styleUrls: ['./search-footer.component.scss'],
  imports: [...UIElements],
})
export class SearchFooterComponent {
  @Output() public readonly searchClicked = new EventEmitter<boolean>();

  constructor() {
    addIcons({
      searchOutline,
    });
  }
}
