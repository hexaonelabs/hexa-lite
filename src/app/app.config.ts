import {
  ApplicationConfig,
  ErrorHandler,
  inject,
  provideAppInitializer,
  provideZoneChangeDetection,
  isDevMode,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { appInitializer } from './app.initializer';
import { WalletconnectService } from './services/walletconnect/walletconnect.service';
import { provideHttpClient } from '@angular/common/http';
import { AppErrorHandlerService } from './services/app-error-handler/app-error-handler.service';
import { provideServiceWorker } from '@angular/service-worker';
import { provideErrorHandler } from './app.errors';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideIonicAngular({ mode: 'ios' }),
    provideAppInitializer(() => appInitializer(inject(WalletconnectService))),
    provideHttpClient(),
    provideErrorHandler(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
