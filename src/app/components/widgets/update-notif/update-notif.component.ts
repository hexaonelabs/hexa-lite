import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { environment } from '@env/environment';
import { ToastOptions } from '@ionic/angular';
import { ToastController } from '@ionic/angular/standalone';
import { Observable, switchMap } from 'rxjs';

@Component({
  selector: 'app-update-notif',
  templateUrl: './update-notif.component.html',
  styleUrls: ['./update-notif.component.scss'],
  imports: [AsyncPipe],
})
export class UpdateNotifComponent  implements OnInit {
  public readonly updateAvailable$: Observable<void>;
  constructor(
    private updates: SwUpdate,
  ) {
    this.updateAvailable$ = this.updates.versionUpdates.pipe(
      switchMap(async (event) => {
        console.log('event', event);
        if (event.type === 'VERSION_READY') {
          await this._displayNotif();
        }
      }),
    );
  }

  ngOnInit() {}

  async activateUpdate() {
    if (!environment.isProd) {
      return;
    }
    await this.updates.activateUpdate()
    location.reload();
  }

  private async _displayNotif() {
    const toast = await new ToastController().create({
      message: 'New version available!',
      position: 'bottom',
      swipeGesture: 'vertical',
      buttons: [
        {
          text: 'Update',
          role: 'ok',
        },
      ],
      color: 'primary',
      duration: 1000 * 60,
    });
    await toast.present();
    await toast.onDidDismiss()
    await this.activateUpdate()
  }

}
