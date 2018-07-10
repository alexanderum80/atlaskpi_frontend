import {Directive, TemplateRef} from '@angular/core';
import {TabDirective} from './tab.directive';

@Directive({selector: '[bwTabHeading]'})
export class TabHeadingDirective {
  public templateRef: TemplateRef<any>;
  public constructor(templateRef: TemplateRef<any>, tab: TabDirective) {
    tab.headingRef = templateRef;
  }
}
