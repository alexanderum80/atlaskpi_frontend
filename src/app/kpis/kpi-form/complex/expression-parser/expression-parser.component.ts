import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';

import { IDataSource } from '../../../../shared/domain/kpis/data-source';
import { IKPI } from '../../../../shared/domain/kpis/kpi';
import { ApolloService } from '../../../../shared/services/apollo.service';
import { ExpressionParserViewModel, ISuggestion } from './expression-parser.viewmodel';

@Component({
    selector: 'kpi-expression-parser',
    templateUrl: './expression-parser.component.pug',
    styleUrls: ['./expression-parser.component.scss'],
    providers: [
        ExpressionParserViewModel
    ]
})
export class ExpressionParserComponent implements OnInit, OnChanges {

    @Input() height = 300;
    @Input() kpis: IKPI[];
    @Input() dataSources: IDataSource[];
    @Input() expression: FormControl;

    @ViewChild('expressionControl') textArea: ElementRef;

    constructor(
        public vm: ExpressionParserViewModel,
        private _apolloService: ApolloService
    ) { }

    ngOnInit() {
        const that = this;
        this.vm.setNativeElement(this.textArea.nativeElement, this.expression);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.kpis) {
            this.vm.updateKpis(changes.kpis.currentValue);
        }

        // if (changes.dataSources) {
        //     this.vm.updateDataSources(changes.dataSources.currentValue);
        // }
    }

    onKeyDown(event: KeyboardEvent) {
        if (event) {
            this.vm.processKeyDownEvent(event);
        }
    }

    onKeyUp(event: KeyboardEvent) {
        if (event) {
            this.vm.processKeyUpEvent(event);
        }
    }

    suggestionClicked(event: MouseEvent, s: ISuggestion) {
        event.preventDefault();

        this.vm.processSelectedSuggestion(s);
    }

    hoverSuggestion(event: MouseEvent, s: ISuggestion) {
        this.vm.updateSelectedSuggestion(s);
    }
}
