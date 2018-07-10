import {Directive, Input, TemplateRef, ViewContainerRef, Inject, OnChanges, AfterViewInit } from '@angular/core';

// export interface KeyAttribute {
//   [key: string]: any;
// }

@Directive({
  /* tslint:disable */
  selector: '[ngTransclude]',
  /* tslint:enable */
  // properties: [ 'ngTransclude' ],
})
export class NgTranscludeDirective implements AfterViewInit, OnChanges {

  public viewRef: ViewContainerRef;

  @Input()
  private ngTransclude: TemplateRef<any>;

  // private _ngTransclude: TemplateRef<any>;

  // private set ngTransclude(te                                                mplateRef: TemplateRef<any>) {
  //   this._ngTransclude = templateRef;
  //   if (templateRef) {
  //     this.viewRef.createEmbeddedView(templateRef);
  //   }
  // }

  // private get ngTransclude(): TemplateRef<any> {
  //   return this._ngTransclude;
  // }

  public constructor( @Inject(ViewContainerRef) viewRef: ViewContainerRef) {
    this.viewRef = viewRef;
  }

  public ngOnChanges(changes: any) {
    if (changes.ngTransclude) {
      this._createEmbeddedView(changes.ngTransclude.currentValue);
    }
  }

  public ngAfterViewInit() {
    this._createEmbeddedView(this.ngTransclude);
  }

  private _createEmbeddedView(viewRef: TemplateRef<any>) {
    if (viewRef) {
      this.viewRef.createEmbeddedView(viewRef);
    }
  }

}
