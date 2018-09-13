import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddBasicTargetsComponent } from './add-basic-targets.component';

describe('AddBasicTargetsComponent', () => {
  let component:AddBasicTargetsComponent;
  let fixture: ComponentFixture<AddBasicTargetsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddBasicTargetsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddBasicTargetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
