import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadChartViewComponent } from './download-chart-view.component';

describe('DownloadChartViewComponent', () => {
  let component: DownloadChartViewComponent;
  let fixture: ComponentFixture<DownloadChartViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DownloadChartViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DownloadChartViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
