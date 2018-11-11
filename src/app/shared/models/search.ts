
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
