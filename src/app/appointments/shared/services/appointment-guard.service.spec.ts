import { TestBed, inject } from '@angular/core/testing';

import { AppointmentGuardService } from './appointment-guard.service';

describe('AppointmentGuardService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AppointmentGuardService]
    });
  });

  it('should ...', inject([AppointmentGuardService], (service: AppointmentGuardService) => {
    expect(service).toBeTruthy();
  }));
});
