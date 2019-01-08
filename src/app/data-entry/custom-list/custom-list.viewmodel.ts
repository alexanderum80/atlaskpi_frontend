import { UserService } from '../../shared/services/user.service';
// Angular Imports
import { FormArray } from '@angular/forms';
import { Injectable } from '@angular/core';
import { Field, ViewModel, ArrayField } from 'src/app/ng-material-components/viewModels';

// App Code
export class ICustomList {
    _id?: string;
    name: string;
    dataType: string;
    listValue: ICustomValue[];
    users?: string[];
}

export class ICustomValue {
    value: string;
}

export class ICustomListValue {
    @Field({ type: String })
    value: string;

    // initialize(model: ICustomValue): void {
    //     this.onInit(model);
    // }
}

@Injectable()
export class CustomListFormViewModel extends ViewModel<ICustomList> {

    constructor(
        private _userSvc: UserService
    ) {
        super(null);
    }

    dataTypeItems = {
        number: 'Number',
        string: 'String'
    };

    defaultCustomListModel: ICustomList = {
        _id: '',
        name: '',
        dataType: this.dataTypeItems.string,
        listValue: []
    };

    newCustomListIndex: number;

    customList: ICustomList[];

    selectedCustomListIndex: number;

    customListModel: FormArray;

    @Field({ type: String })
    _id?: string;

    @Field({ type: String, required: true })
    name: string;

    @Field({ type: String, required: true })
    dataType: string;

    @ArrayField({ type: ICustomListValue })
    listValue: ICustomListValue[];

    initialize(model: ICustomList): void {
        this.onInit(model);
    }

    get payload() {
        debugger;
        let listValues: string[] = this.fg.controls.listValue.value.map(v => {
            return v.value;
        });
        listValues = listValues.filter(f => f !== '');

        return {
            _id: this.fg.controls._id.value || null,
            name: this.fg.controls.name.value,
            dataType: this.fg.controls.dataType.value,
            listValue: listValues
        };
    }

    removeCustomList(listId: string) {
        this.customList = this.customList.filter(a => a._id !== listId);
    }

    dataEntryPermission() {
        return this._userSvc.hasPermission('Assign User To', 'Data Entry');
    }

}
