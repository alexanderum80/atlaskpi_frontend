import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowMapFormComponent } from './show-map-form.component';

describe('ShowMapFormComponent', () => {
  let component: ShowMapFormComponent;
  let fixture: ComponentFixture<ShowMapFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShowMapFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowMapFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
