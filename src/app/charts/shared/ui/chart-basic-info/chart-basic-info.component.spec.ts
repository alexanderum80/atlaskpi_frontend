import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartBasicInfoComponent } from './chart-basic-info.component';

describe('ChartBasicInfoComponent', () => {
  let component: ChartBasicInfoComponent;
  let fixture: ComponentFixture<ChartBasicInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartBasicInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartBasicInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
