import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectableItemFrameComponent } from './selectable-item-frame.component';

describe('SelectableItemFrameComponent', () => {
  let component: SelectableItemFrameComponent;
  let fixture: ComponentFixture<SelectableItemFrameComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectableItemFrameComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectableItemFrameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
