import { NgClass, NgIf } from '@angular/common';
import { Component, ContentChild, ElementRef, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle } from '@ionic/angular/standalone';

const UIElements = [
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
];

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  imports: [...UIElements, NgIf, NgClass],
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class CardComponent {
  @Input() title?: string;
  public readonly isPaletteDark: boolean = false;

  constructor() {
    this.isPaletteDark = localStorage.getItem('theme') === 'dark';
  }
}
