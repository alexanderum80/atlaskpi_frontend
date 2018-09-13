import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicTargetsComponent } from './basic-targets.component';

describe('BasicTargetsComponent', () => {
  let component: BasicTargetsComponent;
  let fixture: ComponentFixture<BasicTargetsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BasicTargetsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BasicTargetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
