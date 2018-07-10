import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DemoOptionsComponent } from './demo-options.component';

describe('DemoOptionsComponent', () => {
  let component: DemoOptionsComponent;
  let fixture: ComponentFixture<DemoOptionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DemoOptionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DemoOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
