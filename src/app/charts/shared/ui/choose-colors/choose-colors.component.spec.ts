import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseColorsComponent } from './choose-colors.component';

describe('ChooseColorsComponent', () => {
  let component: ChooseColorsComponent;
  let fixture: ComponentFixture<ChooseColorsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChooseColorsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChooseColorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
