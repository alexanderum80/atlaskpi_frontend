import { TestBed, inject } from '@angular/core/testing';

import { TableModeService } from './table-mode.service';

describe('TableModeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TableModeService]
    });
  });

  it('should be created', inject([TableModeService], (service: TableModeService) => {
    expect(service).toBeTruthy();
  }));
});
