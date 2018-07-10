import { Directive } from '@angular/core';

@Directive({
    selector: '[bwCardPadding]',
    host: { '[class.card-padding]': 'true' },
})
export class CardPaddingDirective { }
