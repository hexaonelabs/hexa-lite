import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { UpdateNotifComponent } from './components/widgets/update-notif/update-notif.component';
import '@khmyznikov/pwa-install';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [IonRouterOutlet, IonApp, UpdateNotifComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppComponent {
  title = 'hexa-lite';
}
