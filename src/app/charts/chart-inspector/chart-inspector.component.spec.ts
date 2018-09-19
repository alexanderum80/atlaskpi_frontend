import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartInspectorComponent } from './chart-inspector.component';

describe('ChartInspectorComponent', () => {
  let component: ChartInspectorComponent;
  let fixture: ComponentFixture<ChartInspectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartInspectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartInspectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
