import { ErrorHandler, Injectable } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root'
})
export class AppErrorHandlerService implements ErrorHandler {

  constructor() { }

  async handleError(error: any) {
    // close all existing loading overlays
    const ionLoaderCtrl = new LoadingController();
    const ionLoading = await ionLoaderCtrl.getTop();
    if (ionLoading) {
      ionLoading.dismiss();
    }
    // open ionAlert 
    const message = error.message || error.toString();
    const ionAlert = await new AlertController().create({
      header: 'Error',
      message,
      buttons: ['OK']
    });
    await ionAlert.present();    
  }
}
