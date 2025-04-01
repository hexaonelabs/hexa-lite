import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { isConnectedGuard } from './is-connected.guard';

describe('isConnectedGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => isConnectedGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
