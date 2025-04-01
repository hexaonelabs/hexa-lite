import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WalletconnectService } from '@app/services/walletconnect/walletconnect.service';
import { IonButton, IonCol, IonContent, IonGrid, IonRow, IonText } from '@ionic/angular/standalone';
import { firstValueFrom } from 'rxjs';

const UIElements = [
  IonContent,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
];

@Component({
  selector: 'app-connect-page',
  templateUrl: './connect-page.component.html',
  styleUrls: ['./connect-page.component.scss'],
  imports: [...UIElements],
})
export class ConnectPageComponent  implements OnInit {

  constructor(
    private readonly _walletService: WalletconnectService,
    private readonly _router: Router,
  ) { }

  ngOnInit() {}

  async connect() {
    await this._walletService.connect();
    await this._router.navigate(['/wallet']);
  }

}
