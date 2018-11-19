import { Directive, Output, EventEmitter, HostListener, ElementRef } from '@angular/core';
import { Observable } from 'rxjs';

@Directive({
    selector: '[appInViewport]'
})
export class IsInViewportDirective {
    @Output() inViewportChange = new EventEmitter<boolean>();

    private isVisible = false;

    constructor(private el: ElementRef) {
        const that = this;
        window.addEventListener('scroll', function() { that.checkVisibilityChange(el.nativeElement); }, true); // third parameter

        setTimeout(() => {
            // check when the directive renders
            that.checkVisibilityChange(el.nativeElement);
        }, 100);
    }

    @HostListener('window:resize', ['$event'])
    onResize() {
        console.log('resized event fired');
        this.checkVisibilityChange(this.el.nativeElement);
    }

    checkVisibilityChange(el) {
        console.log('checking visibility for: ' + el);

        const visible = isElementInViewport(el);
        if (visible !== this.isVisible) {
            this.isVisible = visible;
            this.inViewportChange.emit(this.isVisible);
        }
    }

}

function isElementInViewport(el: HTMLElement) {

    const rect = el.getBoundingClientRect();

    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
        rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
    );
}
