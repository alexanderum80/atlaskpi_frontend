import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataManuallyComponent } from './data-manually.component';

describe('DataManuallyComponent', () => {
  let component: DataManuallyComponent;
  let fixture: ComponentFixture<DataManuallyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataManuallyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataManuallyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
