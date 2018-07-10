import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NoWidgetsComponent } from './no-widgets.component';

describe('NoWidgetsComponent', () => {
  let component: NoWidgetsComponent;
  let fixture: ComponentFixture<NoWidgetsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NoWidgetsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NoWidgetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
