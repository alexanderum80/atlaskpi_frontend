import { SelectionItem } from '../../ng-material-components';

export function ToSelectionItemList(objArray: any,
                                    idField: string,
                                    valueField: string,
                                    idSelected?: string): SelectionItem[] {
    const result = new Array<SelectionItem>();
    if (!Array.isArray(objArray)) { return result; }

    objArray.forEach(o => {
        result.push(new SelectionItem(o[idField], o[valueField], String(o[idField]) === String(idSelected)));
    });

    return result;
}


