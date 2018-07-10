import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { Component, Input } from '@angular/core';

@Component({
    selector: 'bw-cropped-image',
    template: `
        <div class="layout-column layout-align-center-center">
            <div class="ci-cropper {{class}}" [style.width.px]="width" [style.height.px]="width">
                <div class="cropped-image" [style.width.px]="width" [style.height.px]="width">
                    <img *ngIf="image" src="{{imageUrl}}" [attr.style]="croppedImageStyle"/>
                </div>
            </div>
            <div class="ci-footer text-center" [class.ci-alt]="alt" [style.margin-top.px]="textMargin">
                {{ text }}</div>
        </div>
    `,
    host: { '[style.position]': 'relative' },
})
export class CroppedImageComponent {
    @Input() public class: string;
    @Input() public width = 96;
    @Input() public image: string;
    @Input() public text: string;
    @Input() public alt = false;
    @Input() public border = true;
    @Input() public borderWidth = 0;
    @Input() public coefficient = 1;
    @Input() public radius = 50;

    constructor(private sanitizer: DomSanitizer) { }

    get imageUrl(): string | undefined {
        return this.image ? `${this.image}?width=${this.ampedN}&height=${this.ampedN}` : undefined;
    }

    get ampedN(): number {
        return this._nearestMultipleOfTwo(this.width * 1.5);
    }

    get croppedImageStyle(): SafeStyle {
        const tickness = this.borderWidth || Math.round((this.width * 0.05) * this.coefficient);
        const opacity = this.alt ? 0.8 : 0.3;
        const borderStyle = this.border ? `border: ${tickness}px solid rgba(50, 50, 50, ${opacity});` : '';

        return this.sanitizer
            .bypassSecurityTrustStyle(`
                ${borderStyle} object-fit: cover; margin: auto; border-radius: ${this.radius}%;
                position: relative; width: ${this.width}px; height: ${this.width}px;`);
    }

    get textMargin() {
        return Math.ceil((this.width * 0.06) * this.coefficient);
    }

    private _nearestMultipleOfTwo(n: number): number {
      return  Math.ceil(n / 2) * 2;
    }
}
