import { TestBed, inject } from '@angular/core/testing';

import { ListChartService } from './list-chart.service';

describe('ListChartService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ListChartService]
    });
  });

  it('should ...', inject([ListChartService], (service: ListChartService) => {
    expect(service).toBeTruthy();
  }));
});
