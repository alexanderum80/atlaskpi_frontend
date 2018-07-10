import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExternalSourceKpiFormComponent } from './external-source-kpi-form.component';

describe('ExternalSourceComponent', () => {
  let component: ExternalSourceKpiFormComponent;
  let fixture: ComponentFixture<ExternalSourceKpiFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExternalSourceKpiFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExternalSourceKpiFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
