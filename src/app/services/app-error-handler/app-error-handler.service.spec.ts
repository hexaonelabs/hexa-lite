import { TestBed } from '@angular/core/testing';

import { AppErrorHandlerService } from './app-error-handler.service';

describe('AppErrorHandlerService', () => {
  let service: AppErrorHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppErrorHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
