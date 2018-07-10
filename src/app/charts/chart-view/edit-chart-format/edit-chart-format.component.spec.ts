import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditChartFormatComponent } from './edit-chart-format.component';

describe('EditChartFormatComponent', () => {
  let component: EditChartFormatComponent;
  let fixture: ComponentFixture<EditChartFormatComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditChartFormatComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditChartFormatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
