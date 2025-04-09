import { Routes } from '@angular/router';
import { isConnectedGuard } from './guards/is-connected/is-connected.guard';
import { isNotConnectedGuard } from './guards/is-not-connected/is-not-connected.guard';
import { EarnPageComponent } from './containers/earn-page/earn-page.component';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./containers/connect-page/connect-page.component').then(
        (m) => m.ConnectPageComponent
      ),
    canActivate: [isNotConnectedGuard],
  },
  {
    path: 'wallet',
    canActivate: [isConnectedGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./containers/wallet-page/wallet-page.component').then(
            (m) => m.WalletPageComponent
          ),
      },
      {
        path: ':id',
        loadComponent: () => import('./containers/token-detail-page/token-detail-page.component').then(
          (m) => m.TokenDetailPageComponent
        ),
      }
    ],
  },
  {
    path: 'earn',
    component: EarnPageComponent,
    canActivate: [isConnectedGuard],
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
