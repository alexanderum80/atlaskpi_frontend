import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingProfileComponent } from './loading-profile.component';

describe('LoadingProfileComponent', () => {
  let component: LoadingProfileComponent;
  let fixture: ComponentFixture<LoadingProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoadingProfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadingProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
