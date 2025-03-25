import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonRouterOutlet } from '@ionic/angular/standalone';
import '@khmyznikov/pwa-install';

@Component({
  selector: 'app-root',
  imports: [IonRouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppComponent {
  title = 'hexa-lite';
}
