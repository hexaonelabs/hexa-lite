import { Component, Input, OnInit } from '@angular/core';
import { IonLabel } from '@ionic/angular/standalone';

@Component({
  selector: 'app-label-list',
  templateUrl: './label-list.component.html',
  styleUrls: ['./label-list.component.scss'],
  imports: [IonLabel]
})
export class LabelListComponent {

  @Input() public color?: string;

}
