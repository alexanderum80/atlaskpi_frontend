import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListItemTabularComponent } from './list-item-tabular.component';

describe('ListItemTabularComponent', () => {
  let component: ListItemTabularComponent;
  let fixture: ComponentFixture<ListItemTabularComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListItemTabularComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListItemTabularComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
