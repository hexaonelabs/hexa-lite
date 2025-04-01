import { TestBed } from '@angular/core/testing';

import { WalletconnectService } from './walletconnect.service';

describe('WalletconnectService', () => {
  let service: WalletconnectService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WalletconnectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
