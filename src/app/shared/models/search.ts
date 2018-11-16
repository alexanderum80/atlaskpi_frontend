
export interface ISearchArgs {
    search: string;
  }

export function filterSearch<T>(listItems: T[], field: string, query: ISearchArgs): T[] {
    let itemTemp: T[] = [];
    if (query.search === null || query.search === '') {
        itemTemp = listItems;
    } else {
        itemTemp = listItems.filter(value =>
            value[field].toLowerCase().indexOf(query.search.toLowerCase()) !== -1);
    }
        return itemTemp;
    }

    export function filterSearchMultiple<T>(listItems: T[], fields: string[], query: ISearchArgs): any[] {
        let itemTemp: T[] = [];
        if (query.search === null || query.search === '') { return listItems; }
        itemTemp = listItems.map(item => {
            let returnCondition = false;
            fields.map(field => {
                const matchCondition =
                    (item[field] !== undefined && item[field] !== null && item[field].toString().length > 0)
                    ? item[field].toLowerCase().indexOf(query.search.toLowerCase()) !== -1
                    : false;
                if (matchCondition) { returnCondition = matchCondition; }
            });
            if (returnCondition) { return item; }
        });
        return itemTemp.filter(i => i !== undefined);
    }
