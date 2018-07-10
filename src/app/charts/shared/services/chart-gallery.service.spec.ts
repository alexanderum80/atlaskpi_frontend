import { TestBed, inject } from '@angular/core/testing';

import { ChartGalleryService } from './chart-gallery.service';

describe('ChartGalleryService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ChartGalleryService]
    });
  });

  it('should ...', inject([ChartGalleryService], (service: ChartGalleryService) => {
    expect(service).toBeTruthy();
  }));
});
