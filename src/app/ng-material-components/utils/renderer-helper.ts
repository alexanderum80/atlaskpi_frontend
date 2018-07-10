import { Renderer } from '@angular/core';

export class RendererHelper {

    constructor(private renderer: Renderer) { }

    public addClass(ele: any, classNames: string): void {
        const r = this.renderer;
        const classes: string[] = classNames.split(' ');

        classes.forEach((c) => {
            r.setElementClass(ele, c, true);
        });
    }

    public addAttributes(ele: any, attrs: any): void {
        const r = this.renderer;

        Object.keys(attrs).forEach((key) => {
            r.setElementAttribute(ele, key, attrs[key]);
        });
    }

}
