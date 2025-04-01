import { TestBed } from '@angular/core/testing';

import { AAVEV3Service } from './aave-v3.service';

describe('AAVEV3Service', () => {
  let service: AAVEV3Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AAVEV3Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
