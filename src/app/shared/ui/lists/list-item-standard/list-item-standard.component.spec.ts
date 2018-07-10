import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListItemStandardComponent } from './list-item-standard.component';

describe('ListItemStandardComponent', () => {
  let component: ListItemStandardComponent;
  let fixture: ComponentFixture<ListItemStandardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListItemStandardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListItemStandardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
