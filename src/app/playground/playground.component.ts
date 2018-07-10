import { FormGroup } from '@angular/forms';
import {
    Component,
    OnInit
} from '@angular/core';
import {
    NewWidgetViewModel
} from './new-widget.viewmodel';

@Component({
    selector: 'kpi-playground',
    templateUrl: './playground.component.pug',
    styleUrls: ['./playground.component.scss'],
    providers: [NewWidgetViewModel]
})
export class PlaygroundComponent implements OnInit {
    // vm: NewWidgetViewModel;
    numericMode = 5;

    constructor(public vm: NewWidgetViewModel) {}

    ngOnInit() {

        // this.vm = new NewWidgetViewModel(null);
        this.vm.initialize(null);

        setTimeout(() => {
            this.vm.type = 'numeric';
        }, 2000);

        // this.vm = new NewWidgetViewModel({
        //     name: 'name',
        //     size: 'small',
        //     dateRange: {
        //         predefined: 'last month',
        //         customRange: {
        //             from: new Date(),
        //             to: new Date()
        //         }
        //     },
        //     kpiFilters: [
        //         { field: 'field 1', value: 'value 1' },
        //         { field: 'field 2', value: 'value 2' }
        //     ]
        // });


        // this.fg = this.vm.formGroup;

        // this.vm.formGroup.valueChanges.subscribe(v => {
        //     console.log(JSON.stringify(v));
        // });

        const that = this;
        setTimeout(function() {
            that.vm.name = 'orlando';
            that.vm.dateRange = {
                predefined: 'last year',
                customRange: {
                    from: new Date(),
                    to: new Date()
                }
            };
            // console.log('updating sizes');
            // that.vw.sizes = [
            //     {
            //         id: 'small',
            //         title: 'Small'
            //     },
            //     {
            //         id: 'big',
            //         title: 'Big'
            //     }
            // ];

            // const value = that.vw.value;

        }, 2000);
    }

    saveWidget() { }

    cancel() { }

    get showingBigWidget() { return false; }

}
