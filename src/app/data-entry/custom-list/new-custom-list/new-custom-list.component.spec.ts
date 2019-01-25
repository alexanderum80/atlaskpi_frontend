import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewCustomListComponent } from './new-custom-list.component';

describe('NewCustomListComponent', () => {
  let component: NewCustomListComponent;
  let fixture: ComponentFixture<NewCustomListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewCustomListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewCustomListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
