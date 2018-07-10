import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NoDatasourcesComponent } from './no-datasources.component';

describe('NoDatasourcesComponent', () => {
  let component: NoDatasourcesComponent;
  let fixture: ComponentFixture<NoDatasourcesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NoDatasourcesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NoDatasourcesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
