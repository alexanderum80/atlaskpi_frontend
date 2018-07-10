export class PagedQuery<T> {
  total: number;
  itemsPerPage: number;
  current: number;
  max?: number;
  data: T[];

  // ng2-pagination parameter
  currentPage?: number;

  constructor(obj: PagedQuery<T> | any) {
        Object.assign(this, obj);

        // ng2-pagination parameter
        this.currentPage = this.current;
  }
}

