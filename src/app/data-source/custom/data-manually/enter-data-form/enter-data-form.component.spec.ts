import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnterDataFormComponent } from './enter-data-form.component';

describe('EnterDataFormComponent', () => {
  let component: EnterDataFormComponent;
  let fixture: ComponentFixture<EnterDataFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnterDataFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnterDataFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
