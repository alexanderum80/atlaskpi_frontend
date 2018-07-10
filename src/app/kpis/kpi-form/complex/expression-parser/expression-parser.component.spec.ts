import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpressionParserComponent } from './expression-parser.component';

describe('ExpressionParserComponent', () => {
  let component: ExpressionParserComponent;
  let fixture: ComponentFixture<ExpressionParserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExpressionParserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpressionParserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
