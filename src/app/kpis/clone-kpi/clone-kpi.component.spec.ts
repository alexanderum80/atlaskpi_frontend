import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CloneKpiComponent } from './clone-kpi.component';

describe('CloneKpiComponent', () => {
  let component: CloneKpiComponent;
  let fixture: ComponentFixture<CloneKpiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CloneKpiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CloneKpiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
