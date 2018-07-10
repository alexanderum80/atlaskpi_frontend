import { TestBed, inject } from '@angular/core/testing';

import { SquareAuthService } from './square-auth.service';

describe('SquareAuthService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SquareAuthService]
    });
  });

  it('should be created', inject([SquareAuthService], (service: SquareAuthService) => {
    expect(service).toBeTruthy();
  }));
});
