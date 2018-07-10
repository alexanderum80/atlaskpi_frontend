import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TableModeComponent } from './table-mode.component';

describe('TableModeComponent', () => {
  let component: TableModeComponent;
  let fixture: ComponentFixture<TableModeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TableModeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableModeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
