import { TestBed } from '@angular/core/testing';

import { LIFIService } from './lifi.service';

describe('LIFIService', () => {
  let service: LIFIService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LIFIService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
