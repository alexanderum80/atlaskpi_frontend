import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmptyWidgetListComponent } from './empty-widget-list.component';

describe('EmptyWidgetListComponent', () => {
  let component: EmptyWidgetListComponent;
  let fixture: ComponentFixture<EmptyWidgetListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmptyWidgetListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmptyWidgetListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
