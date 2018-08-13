import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListTargetsComponent } from './list-targets.component';

describe('ListTargetsComponent', () => {
  let component: ListTargetsComponent;
  let fixture: ComponentFixture<ListTargetsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListTargetsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListTargetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
