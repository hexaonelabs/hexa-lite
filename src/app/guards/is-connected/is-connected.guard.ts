import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { WalletconnectService } from '@app/services/walletconnect/walletconnect.service';
import { firstValueFrom } from 'rxjs';

export const isConnectedGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const walletService = inject(WalletconnectService);
  const walletAddress = await firstValueFrom(walletService.walletAddress$);
  if (!walletAddress) {
    router.navigateByUrl('/');
    return false;
  } else {
    return true;
  }
};
