import { Component, OnInit } from '@angular/core';
import { Input } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';

import { ITagItem } from '../../domain/shared/tag';

@Component({
    selector: 'kpi-tags',
    templateUrl: './tags.component.pug'
})
export class TagsComponent implements OnInit {
    @Input() fg: FormGroup;
    @Input() field: string;
    @Input() existingTags: string[];
    @Input() items: ITagItem[];
    @Input() placeholder: string;

    private _control: FormArray;

    ngOnInit() {
        if (!this.fg) {
            throw new Error('Tags component requires a form group');
        }

        // add form control if it does not exist already
        if (!this.fg.get(this.field)) {
            this.fg.addControl(this.field, new FormArray(null));
        }

        this._control = this.fg.get(this.field) as FormArray;

        this._control.valueChanges.subscribe(value => {
            this.items = value;
        });

        if (!this.items) {
            this.items = this._control.value;
        }
    }

    onAdd(item) {
        this._control.push(new FormControl(item));
    }

    onRemove(item) {
        const index = this._control.controls.findIndex(c => c.value === item.value);
        this._control.removeAt(index);
    }
}
