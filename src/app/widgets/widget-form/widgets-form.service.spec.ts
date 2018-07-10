import { TestBed, inject } from '@angular/core/testing';

import { WidgetsFormService } from './widgets-form.service';

describe('WidgetsServiceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WidgetsFormService]
    });
  });

  it('should ...', inject([WidgetsFormService], (service: WidgetsFormService) => {
    expect(service).toBeTruthy();
  }));
});
