import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartFormatInfoComponent } from './chart-format-info.component';

describe('ChartFormatInfoComponent', () => {
  let component: ChartFormatInfoComponent;
  let fixture: ComponentFixture<ChartFormatInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartFormatInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartFormatInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
